import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  ThemeProvider,
  darken,
  lighten
} from "@material-ui/core/styles";
import responsiveFontSizes from "@material-ui/core/styles/responsiveFontSizes";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FavoriteBorderRoundedIcon from "@material-ui/icons/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import IconButton from "@material-ui/core/IconButton";
import Pagination from "@material-ui/lab/Pagination";
import Button from "@material-ui/core/Button";

const itemsPerPage = 6;

const url = `${
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000"
}/teams`;

interface Team {
  name: string;
  founded: number;
  logo: string;
}

const sections = ["all", "favorites"] as const;

type Sections = typeof sections[number];

const primaryMain = "#3c93de";
const secondaryMain = "#f63333";

const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      primary: {
        main: primaryMain,
        dark: darken(primaryMain, 0.1),
        light: lighten(primaryMain, 0.1)
      },
      secondary: {
        main: secondaryMain,
        dark: darken(secondaryMain, 0.1),
        light: lighten(secondaryMain, 0.1)
      }
    },
    overrides: {
      MuiButton: {
        root: {
          textTransform: "capitalize"
        }
      }
    }
  })
);

const getTeams = async (): Promise<Team[]> => {
  try {
    return (await axios.get(url)).data;
  } catch {
    throw Error("Unable to get soccer teams, please try again later");
  }
};

const createClasses = makeStyles((theme) => ({
  teamItem: {
    margin: theme.spacing(4),
    padding: theme.spacing(2)
  },
  grow: {
    flexGrow: 1
  },
  title: {
    color: theme.palette.primary.dark
  },
  button: {
    margin: theme.spacing(1),
    textTransform: "capitalize",
    "&$disabled": {
      backgroundColor: darken(primaryMain, 0.1)
    }
  },
  disabled: {}
}));

const App = () => {
  const classes = createClasses();
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [curTeams, setCurTeams] = useState<Team[]>([]);
  const [pageTeams, setPageTeams] = useState<Team[]>([]);
  const [page, setPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedSection, setSelectedSection] = useState<Sections>("all");

  const favoriteTeams = useMemo(
    () => allTeams.filter(({ name }) => favorites[name]),
    [favorites, allTeams]
  );

  const pagesCount = useMemo(() => Math.ceil(curTeams.length / itemsPerPage), [
    curTeams
  ]);

  // Get favorite teams data from local storage
  useEffect(() => {
    const data = localStorage.getItem("favorites");
    if (data) {
      setFavorites(JSON.parse(data));
    }
  }, []);

  // Get teams data from server
  useEffect(() => {
    getTeams()
      .then((res) => {
        setAllTeams(res);
        setCurTeams(res);
        setPageTeams(res.slice(0, itemsPerPage));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // Handle "Like" button, saves data in local storage
  const handleFavoriteClick = (name: string) => () => {
    const newFavorites = Object.entries(favorites).reduce(
      (acc, [key, value]) => {
        acc[key] = key === name ? !value : value;
        return acc;
      },
      { [name]: true } as Record<string, boolean>
    );
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  // Get page teams from current teams
  const handlePaginationChange = (e: object, n: number) => {
    setPage(n);
    setPageTeams(curTeams.slice(itemsPerPage * (n - 1), itemsPerPage * n));
  };

  const handleChangeSection = (section: Sections) => () => {
    let teams: Team[];
    switch (section) {
      case "all":
        teams = allTeams;
        break;
      case "favorites":
        teams = favoriteTeams;
    }
    setPage(1);
    setCurTeams(teams);
    setSelectedSection(section);
    setPageTeams(teams.slice(0, itemsPerPage));
    setPageTeams(teams.slice(0, itemsPerPage));
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="relative" color="primary">
        <Typography align="center" variant="h1">
          Soccer Teams Tracker
        </Typography>
      </AppBar>

      <div>
        {/* @ts-ignore */}
        <Box component={Grid} container p={3} justifyContent="center">
          <Grid container item xs={12}>
            <Grid item xs={6}>
              <Typography variant="h3" className={classes.title}>
                Our Teams:
              </Typography>
            </Grid>
            <Grid container justify="flex-end" item xs={6}>
              {sections.map((section) => (
                <Button
                  color="primary"
                  variant="contained"
                  value={section}
                  onClick={handleChangeSection(section)}
                  key={section}
                  disabled={selectedSection === section}
                  classes={{
                    root: classes.button,
                    disabled: classes.disabled
                  }}
                >
                  <Typography>{section}</Typography>
                </Button>
              ))}
            </Grid>
          </Grid>

          {error && (
            // @ts-ignore
            <Box component={Paper} p={3} elevation={3}>
              <Typography color="error" variant="h4">
                {error}
              </Typography>
            </Box>
          )}

          {pageTeams.map(({ founded, logo, name }) => (
            <Paper
              elevation={3}
              component={Grid}
              // @ts-ignore
              container
              item
              className={classes.teamItem}
              md={5}
              sm={12}
              key={name}
            >
              <Grid container direction="column" item xs>
                <Typography variant="h6">Team name: {name}</Typography>
                <Typography>Founded at: {founded}</Typography>
                <Grid
                  container
                  justify="center"
                  alignItems="flex-end"
                  className={classes.grow}
                >
                  <IconButton onClick={handleFavoriteClick(name)}>
                    {favorites[name] ? (
                      <FavoriteRoundedIcon color="secondary" />
                    ) : (
                      <FavoriteBorderRoundedIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
              <Grid item container xs justify="flex-end">
                <img src={logo} alt={`${name}_logo`} />
              </Grid>
            </Paper>
          ))}
          {allTeams.length > 0 && (
            <Grid container item justify="center">
              <Pagination
                page={page}
                count={pagesCount}
                color="primary"
                onChange={handlePaginationChange}
              />
            </Grid>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default App;
