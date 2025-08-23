## An API for [KAVI](https://en.wikipedia.org/wiki/National_Audiovisual_Institute_(Finland))
(Finland's official authority for movie and TV ratings such as age limits and content warnings)

## Example classifications
![Example image of classifications](https://kavi.fi/wp-content/uploads/2020/01/ikarajat_www.png)
(details in Finnish: https://kavi.fi/wp-content/uploads/2023/12/Luokittelukriteerit-2023.pdf)
<details>
<summary>API docs</summary>

## GET /search/series
Description: Search for a TV series by name. Returns information about the series including number of episodes, general age limit, and warnings.

### Query Parameters

| Name | Type   | Required | Description                          |
|------|--------|----------|--------------------------------------|
| name | string | ✅        | The name of the series to search for |


## Responses
### 200 OK: Series found. Returns a ShowSearchResult object.
```json
{
  "name": "Dexter",
  "nameFi": "Dexter",
  "nameSv": "Dexter",
  "_id": "abc123",
  "episodes": 96,
  "generalAgeLimit": 16,
  "generalWarnings": ["violence", "drugs"]
}
```

<details>
<summary>ShowSearchResult</summary>


| Property          | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| name             | string     | Series name                                      |
| nameFi           | string     | Optional Finnish name                            |
| nameSv           | string     | Optional Swedish name                            |
| _id              | string     | Series ID                                        |
| episodes         | number     | Total number of episodes                         |
| generalAgeLimit  | number     | Age rating for the series                        |
| generalWarnings  | string[]   | Array of warnings (drugs, anxiety, violence, sex)|
</details>

### 400 Bad Request: missing name query parameter.
```json
{
  "error": 1,
  "description": "Series name not included! Please use ?name=..."
}
```

### 404 Not Found: Series not found.
```
{
  "error": 2,
  "description": "Series not found!"
}
```
## GET /search/episodes
Description: Returns a list of episodes for a given series, optionally filtered by season or episode range.

### Query Parameters
| Name              | Type    | Required | Description                                                                 |
|-------------------|---------|----------|-----------------------------------------------------------------------------|
| id                | string  | ✅        | The ID of the show (see /search/series)                                    |
| starting_season   | integer | ❌        | Which season to start the list from                                        |
| ending_season     | integer | ❌        | Which season to stop the list at                                           |
| starting_episode  | integer | ❌        | Which episode to start the list from                                       |
| ending_episode    | integer | ❌        | Which episode to end the list at                                           |
| episode_filtering | string  | ❌        | How to filter starting/ending episodes. Options: `begin-end`, `every-season` |

Example of episode_filtering:

begin-end: affects only the first and last season (e.g., seasons 4-6 episodes 2-4 → s4x2, s4x3, s4x4, s5x1, s5x2…)
every-season: affects every season (e.g., seasons 4-6 episodes 2-4 → s4x2, s4x3, s4x4, s5x2, s5x3…)

## Response:
### Status 200: JSON array of episodes

```json
[
  {
    "name": "Pilot",
    "_id": "abc123",
    "year": 2025,
    "synopsis": "The first episode",
    "format": "bluray",
    "duration": "00:45:00",
    "creationDate": "2025-08-22",
    "registrationDate": "2025-08-22",
    "agelimit": 16,
    "warnings": ["violence", "drugs"],
    "episode": 1,
    "season": 1
  },
  {
    "name": "Second Episode",
    "nameFi": "Toinen jakso",
    "nameSv": "Andra avsnittet",
    "_id": "abc124",
    "year": 2025,
    "synopsis": "The second episode",
    "format": "bluray",
    "duration": "00:50:00",
    "creationDate": "2025-08-23",
    "registrationDate": "2025-08-23",
    "agelimit": 16,
    "warnings": ["anxiety"],
    "episode": 2,
    "season": 1
  }
]
```
</details>

## Test it out
These links are clickable in the browser

### Searching for a show
https://kavi.frii.site/search/series?name=Dexter


### Searching for episodes
https://kavi.frii.site/search/episodes?id=542bb51b25b88ee7ebb71854


### Searching for episodes between season 3 and 6
https://kavi.frii.site/search/episodes?id=542bb51b25b88ee7ebb71854&starting_season=3&ending_season=6

### Searching for episodes between season 3 and 6 starting from episode 4 and ending in episode 8
https://kavi.frii.site/search/episodes?id=542bb51b25b88ee7ebb71854&starting_season=3&ending_season=6&starting_episode=4&ending_episode=8