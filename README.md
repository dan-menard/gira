# gira ✨

Some Jira-like dashboard features for Github's project boards.

## Setup

gira makes requests to github on your behalf, so it needs an authentication token. The simplest way to do this is if you set up a [personal Github token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line), and create a file called `.env` in the project root that looks like this:

```
GITHUB_TOKEN=123456789
```

(except put your token instead of 123456789)

## Run

To run the project, clone this repo and run `npm server.js`.
