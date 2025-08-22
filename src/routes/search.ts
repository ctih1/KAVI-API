import expressPkg from "express";
import type { Request, Response } from "express";
import type { EpisodeRoot, Program, SeriesResponseRoot } from "../kaviresponse";

const { Router } = expressPkg;

type EpisodeMatchType = "begin-end" | "every-season"
const router = Router();
router.get("/series", async (req: Request, res: Response) => {
    console
    let seriesName = req.query.name;

    if(!seriesName) {
        res.status(400).json({error: 1, description: "Series name not included! Pleaes use ?name=..."});
        return;
    }

    const showResult = await getShows({name: seriesName.toString()});

    if(!showResult) {
        res.status(404).json({error: 2, description: "Series not found!"});
        return;
    }

    res.status(200).json(showResult);
    return;
});

router.get("/episodes", async (req: Request, res: Response) => {
    let id = req.query.id;
    if(!id) {
        res.status(400).json({error: 3, description: "Series ID not defined! You can find your series id with /search/series?name=..."});
        return;
    }

    let minSeason = Number(req.query.starting_season) || undefined;
    let maxSeason = Number(req.query.ending_season) || undefined;

    let minEpisode = Number(req.query.starting_episode) || undefined;
    let maxEpisode = Number(req.query.ending_episode) || undefined;

    let episodeMode = req.query.episode_filtering || "begin-end";

    const json = await getEpisodes(id.toString(), minSeason, maxSeason, minEpisode, maxEpisode, episodeMode.toString() as EpisodeMatchType);

    res.status(200).json(json);
});



interface ShowSearchOptions {
    page: number,
    name: string
}

function buildShowString(options: Partial<ShowSearchOptions>): URL {
    // dexter?page=0
    // &filters%5B%5D=2
    // &classifier=
    // &registrationDateRange=
    // &reclassified=false
    // &agelimits=
    // &warnings=
    // &ownClassificationsOnly=false
    // &showDeleted=false
    // &showCount=true
    // &sorted=true
    // &reclassifiedBy=
    // &buyer=
    // &searchFromSynopsis=false
    // &directors=
    // &sortBy=
    // &sortOrder=ascending
    let searchUrl = new URL(`https://luokittelu.kavi.fi/programs/search/${options.name??""}`);

    searchUrl.searchParams.append("filters[]","2");
    searchUrl.searchParams.append("classifier","");
    searchUrl.searchParams.append("registrationDateRange","");
    searchUrl.searchParams.append("reclassified","");
    searchUrl.searchParams.append("agelimits","");
    searchUrl.searchParams.append("warnings","");
    searchUrl.searchParams.append("ownClassificationsOnly","");
    searchUrl.searchParams.append("showDeleted","false");
    searchUrl.searchParams.append("showCount","true");
    searchUrl.searchParams.append("sorted","true");
    searchUrl.searchParams.append("reclassifiedBy","");
    searchUrl.searchParams.append("buyer","");
    searchUrl.searchParams.append("searchFromSynopsis","false");
    searchUrl.searchParams.append("directors","");
    searchUrl.searchParams.append("sortBy","");
    searchUrl.searchParams.append("sortOrder","ascending");

    return searchUrl;
}

const Warnings = [
    "drugs",
    "anxiety",
    "violence",
    "sex"
] as const;

interface ShowSearchResult {
    name: String;
    nameFi?: String;
    nameSv?: String;
    _id: String;
    episodes: Number;
    generalAgeLimit: Number;
    generalWarnings: typeof Warnings
}

async function getShows(options: Partial<ShowSearchOptions>): Promise<ShowSearchResult[]> {
    const response = await fetch(buildShowString(options));
    const json: SeriesResponseRoot = await response.json();
    console.log(json);

    let results: ShowSearchResult[] = [];

    for(let program of json.programs) {
        results.push({
            name: program.name.join(", "),
            nameFi: program.nameFi.join(", "),
            nameSv: program.name.join(", "),
            _id: program._id,
            episodes: program.episodes.count,
            generalAgeLimit: program.episodes.agelimit,
            generalWarnings: program.episodes.warnings as unknown as typeof Warnings
        })
    }
    return results;
}


interface EpisodeSearchResult {
    name: String;
    nameFi?: String;
    nameSv?: String;
    _id: String;
    year: number,
    synopsis: string,
    format: string // e.g bluray, cd, dvd
    duration: string // hh:mm::ss
    creationDate: string,
    registrationDate: string,
    agelimit: number,
    warnings: typeof Warnings,
    episode: number,
    season: number
}


// TODO: Validate seriesId before searching
async function getEpisodes(seriesId: String,
    beginSeason: number = Number.MIN_VALUE,
    endSeason: number = Number.MAX_VALUE,
    beginEpisode: number = Number.MIN_VALUE,
    endEpisode: number = Number.MAX_VALUE,
    episodeNumberMatchMode: EpisodeMatchType
): Promise<EpisodeSearchResult[]> {
    console.log(`Searching for ${seriesId}`);
    const response = await fetch(`https://luokittelu.kavi.fi/episodes/${seriesId}`);
    const json: EpisodeRoot[] = await response.json();

    let results: EpisodeSearchResult[] = [];

    for(let episode of json) {
        if(episode.season > endSeason || episode.season < beginSeason) {
            console.debug(`Skipping season s${episode.season}e${episode.episode}: season doesn"t match filter`);
            continue;
        }

        if(episodeNumberMatchMode === "every-season") {
            if(episode.episode > endEpisode || episode.episode < beginEpisode) {
                console.debug(`Skipping season s${episode.season}e${episode.episode}: episode doesn"t match filter (every-season)`);
                continue;
            }
        } else {
            if(episode.season === beginSeason && episode.episode < beginEpisode) {
                console.debug(`Skipping season s${episode.season}e${episode.episode}: episode doesn"t match low filter (begin-end)`);
                continue;
            }
            if(episode.season === endSeason && episode.episode > endEpisode) {
                console.debug(`Skipping season s${episode.season}e${episode.episode}: episode doesn"t match high filter (begin-end)`);
                continue;
            }
        }

    

        let latestClassification = episode.classifications.at(-1);
        if(latestClassification === undefined) {
            console.warn(`Latest classification for id ${seriesId} is undefined!`);
            continue;
        }

        results.push({
            name: episode.name.join(", "),
            nameFi: episode.nameFi.join(", "),
            nameSv: episode.name.join(", "),
            _id: episode._id,
            year: Number(episode.year)||0,
            synopsis: episode.synopsis,
            format: latestClassification.format??"unknown",
            duration: latestClassification.duration??"unknown",
            creationDate: latestClassification.creationDate??"unknown",
            registrationDate: latestClassification.registrationDate??"unknown",
            agelimit: episode.agelimitForSorting,
            warnings: latestClassification.warningOrder as unknown as typeof Warnings,
            episode: episode.episode,
            season: episode.season
        });
    }
    console.debug(`Found ${json.length} episodes`)
    return results;
}
export default router;