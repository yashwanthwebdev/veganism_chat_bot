import Stack from "@mui/material/Stack";
import { TextField, Typography } from "@mui/material";
import { userStatements, botQuestions } from "./dataset.js";
// import { personalBotQuestions, personalUserTexts } from "./dataset.js";
// import { modelDataSet } from "./dataset.js";
import { useEffect, useState, useRef } from "react";
// import styles from "./App.module.css";
// import leven from "leven";
import * as tf from "@tensorflow/tfjs";
// import * as qna from "@tensorflow-models/qna";
// import { diceCoefficient } from "dice-coefficient";
// import use from "@tensorflow-models/universal-sentence-encoder";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
// import styles from "./App.css";
import SendIcon from "@mui/icons-material/Send";
// import CircularProgress from "@mui/material/CircularProgress";
// import { Dna } from "react-loader-spinner";

import * as use from "@tensorflow-models/universal-sentence-encoder";
// const use = require("@tensorflow-models/universal-sentence-encoder");

function App() {
  const [question, setQuestion] = useState("");
  const [userLastActive, setUserLastActive] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [suitableReply, setSuitableReply] = useState("");
  const [list, setList] = useState([
    "",
    "hey! I am glad that you want to talk to me about veganism. What do you want to ask me?",
  ]);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const botQuestionsIndices = useRef([]);
  const loadModel = async () => {
    // const loadedModel = await qna.load();
    const loadedModel = await use.load();
    setModel(loadedModel);
    console.log("model is being loaded");
  };

  useEffect(() => {
    // comment 1
    //comment 2
    loadModel();
  }, []);

  async function memodCosineFunction() {
    if (question.trim() === "") {
      setError(true);
      return;
    } else {
      setError(false);
    }
    let uniqueWordsQuestion = [...new Set(question.toLowerCase().split(" "))];
    console.log("unique words : ", uniqueWordsQuestion);
    if (
      uniqueWordsQuestion.length <= 1 &&
      !"hello hi hey bonjour henlo".includes(uniqueWordsQuestion)
    ) {
      // window.alert("kindly make the question longer");
      setList([
        ...list,
        question.toLowerCase(),
        `a) Kindly keep the conversation related to veganism b) Stick to English since that is the only language I know c) Kindly include more words in your statements for more clarity  `,
      ]);

      setQuestion("");
      setIsProcessing(false);
      setTimeout(() => {
        let convoBox = document.getElementById("convoBox");
        convoBox.scrollTo({
          top: convoBox.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
      return;
    }

    // setList([...list, question]);
    setList((prevState) => [...prevState, question]);
    setTimeout(() => {
      let convoBox = document.getElementById("convoBox");
      convoBox.scrollTo({
        top: convoBox.scrollHeight,
        behavior: "smooth",
      });
    }, 500);
    setIsProcessing(true);
    let embedArray = [question.toLowerCase(), ...Object.keys(userStatements)];
    let minDistance = 1;
    let reply = "";
    const embeddings = (await model.embed(embedArray)).unstack();

    let foo = new Promise((resolve, reject) => {
      embeddings.forEach(async (eachEmbedding, index) => {
        if (index === 0) {
          return;
        }
        let tempDistance = await tf.losses
          .cosineDistance(embeddings[0], embeddings[index], 0)
          .data();
        tempDistance = tempDistance[0];

        //optimization probably?
        if (tempDistance < minDistance) {
          minDistance = tempDistance;
          reply = userStatements[Object.keys(userStatements)[index - 1]];
          console.log("changing reply");
        }

        if (index === embeddings.length - 1) {
          resolve();
        }
      });
    });

    foo.then(() => {
      if (reply === "ask the user a question") {
        // window.alert("user wants th bot to ask a question");
        if (botQuestionsIndices.current.length === botQuestions.length) {
          reply =
            // "I don't have anything left to ask you. I hope that my previous questions left you with insightful thoughts that can convince you to go vegan!";
            "I don't have anything left to ask you.";
        } else {
          botQuestions.forEach((eachQuestion, index) => {
            let randomIndex = Math.floor(Math.random() * botQuestions.length);
            if (!botQuestionsIndices.current.includes(randomIndex)) {
              reply = botQuestions[randomIndex];
              botQuestionsIndices.current.push(randomIndex);
            }
          });
        }
      }

      if (minDistance < 0.5) {
        setList((prevState) => [...prevState, reply]);
      } else {
        setList((prevState) => [
          ...prevState,
          `Kindly keep the conversation related to veganism`,
        ]);
      }

      setQuestion("");
      setIsProcessing(false);
      setTimeout(() => {
        let convoBox = document.getElementById("convoBox");
        convoBox.scrollTo({
          top: convoBox.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    });
  }

  return (
    <Stack
      // xs={3}
      className="App"
      style={{
        backgroundColor: "rgb(43, 42, 39)",
        // backgroundColor: "white",
        margin: "0ch",
        padding: "0ch",
        height: "100vh",
        // border: "10px red solid",
        boxSizing: "border-box",
      }}
    >
      {model ? (
        <Stack
          direction="column"
          spacing={3}
          sx={{
            // backgroundColor: "red",
            height: "100%",
            justifyContent: "space-around",
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            sx={{
              alignSelf: "center",
              width: { xs: "90%", md: "70%", lg: "50%" },
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              height: "100%",
            }}
          >
            <Stack
              direction="column"
              sx={{
                width: {
                  xs: "80%",
                  lg: "max-content",
                },
                // background:
                //   "linear-gradient(to right, rgb(67,124,205), rgb(69,214,202))",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "800",
                  fontSize: "1.9rem",
                  background:
                    // "linear-gradient(to right, rgb(168, 60, 50), rgb(50, 168, 54))",
                    "linear-gradient(to right, rgb(168, 60, 50), rgb(125, 235, 52))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.2ch",
                  fontFamily: "'Silkscreen', sans-serif",
                }}
              >
                Veganism chatbot
              </Typography>
              <Stack sx={{ color: "red" }}>
                <LinearProgress
                  color="success"
                  sx={{
                    // backgroundColor: "teal",
                    borderRadius: "100%",
                    filter: "blur(0px)",
                    backgroundColor: "limegreen",
                    backgroundColor: "#7FFF00",
                  }}
                />
              </Stack>
              {/* <Typography
                variant="caption"
                // sx={{ fontWeight: "700", fontSize: "0.8rem", color: "white" }}
                sx={{ color: "white" }}
              >
                (work in progress)
              </Typography> */}
            </Stack>

            {/* chat box  */}
            <Stack
              direction="column"
              sx={{
                height: "60%",
                // width: "50%",
                width: { xs: "100%", md: "100%", lg: "100%" },
                // backgroundColor: "lightgrey",
                // backgroundColor: "rgb(43, 42, 39)",
                alignSelf: "center",
                // boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                borderRadius: "1ch",
                justifyContent: "space-around",
              }}
            >
              {/* answer  */}
              <Stack
                id="convoBox"
                direction="column"
                sx={{
                  // overflowY: "scroll",
                  overflowY: "scroll",
                  scrollSnapType: "y mandatory",
                  height: "95%",
                  width: "100%",
                  // backgroundColor: "lightgrey",
                  // backgroundColor: "orange",
                  alignSelf: "center",
                  // boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  // padding: "1ch",
                  borderRadius: "1ch",
                }}
                spacing={3}
              >
                {list.map((eachMessage, index) => {
                  return eachMessage.length > 0 ? (
                    <Stack
                      key={index + eachMessage}
                      sx={{
                        scrollSnapAlign: "end",
                        alignSelf: index % 2 === 0 ? "end" : "start",
                        marginRight: index % 2 === 0 ? "0ch" : "0ch",
                        marginLeft: index % 2 === 0 ? "0ch" : "1ch",
                        maxWidth: "50%",
                        // backgroundColor:
                        //   index % 2 === 0 ? "lightgreen" : "white",
                        // color: index % 2 === 0 ? "black" : "black",
                        // color: index % 2 !== 0 ? "white" : "limegreen",
                        color: index % 2 !== 0 ? "white" : "#0BFFFF",
                        padding: "1ch",
                        borderRadius: "1ch",
                        marginBottom: "1ch",
                        wordWrap: "break-word",
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: "700",
                      }}
                    >
                      <Typography
                        // key={index}
                        sx={{
                          fontFamily: "'Oswald', sans-serif",
                          fontWeight: "700",
                          wordWrap: "break-word",
                        }}
                      >
                        {eachMessage.split("@")[0]}
                      </Typography>

                      <Stack spacing={2} direction="row">
                        <Typography>
                          {eachMessage.includes("@") ? (
                            eachMessage.split("@").length >= 2 ? (
                              <a
                                href={`${eachMessage.split("@")[1]}`}
                                target="_blank"
                              >
                                Link 1{" "}
                              </a>
                            ) : (
                              <></>
                            )
                          ) : (
                            <></>
                          )}
                        </Typography>

                        <Typography>
                          {eachMessage.includes("@") ? (
                            eachMessage.split("@").length >= 3 ? (
                              <a
                                href={`${eachMessage.split("@")[2]}`}
                                target="_blank"
                              >
                                Link 2{" "}
                              </a>
                            ) : (
                              <></>
                            )
                          ) : (
                            <></>
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : (
                    <></>
                  );
                })}
              </Stack>
              {/* {isProcessing === true ? (
                <Stack
                  direction="column"
                  sx={{
                    // justifySelf: "end",
                    marginLeft: "1ch",
                    width: "50%",

                    // backgroundColor: "white",
                    // justifyContent: "space-evenly",
                  }}
                >
                  <LinearProgress
                    sx={{
                      backgroundColor: "teal",
                      borderRadius: "100%",
                      filter: "blur(2px)",
                    }}
                  />
                </Stack>
              ) : (
                <></>
              )} */}
              {isProcessing === true ? (
                <Stack
                  sx={{
                    justifySelf: "end",
                    marginLeft: "1ch",
                    backgroundColor: "grey",
                    padding: "0.5ch",
                  }}
                >
                  <Typography
                    variant="subtitle"
                    sx={{
                      // fontWeight: "600",
                      letterSpacing: "0.2ch",
                      color: "grey",
                      color: "#D3D3D3",
                      color: "black",
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: {
                        xs: "0.75rem",
                        lg: "0.7rem",
                      },
                    }}
                  >
                    *please wait till I come up with a reply*
                  </Typography>
                </Stack>
              ) : (
                <></>
              )}
              {error ? (
                <Alert
                  sx={{
                    // width: "content",
                    justifySelf: "center",
                    alignSelf: "center",
                    backgroundColor: "white",
                    color: "firebrick",
                    padding: "0ch 1ch",
                  }}
                  severity="error"
                >
                  Type something!
                </Alert>
              ) : (
                <></>
              )}
            </Stack>

            {/* question */}
            <Stack
              direction="row"
              sx={{
                width: "100%",
                position: "relative",
                // outline: "2px orange solid",
              }}
            >
              <TextField
                id="askInput"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setUserLastActive(0);
                }}
                placeholder="type your question here..."
                sx={{
                  width: "100%",
                  border: "none",
                  // boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  // boxShadow: "rgba(0, 0, 0, 0.45) 0px 15px 20px -20px",
                  boxShadow: "grey 0px 15px 20px -18px",
                  backgroundColor: "lightgrey",
                  borderRadius: "1ch",
                  alignSelf: "center",
                }}
              ></TextField>

              {isProcessing === false ? (
                <SendIcon
                  sx={{
                    position: "absolute",
                    right: "1ch",
                    color: "green",
                    height: "100%",
                    zIndex: "99999",
                    // fill: "limegreen",
                    fill: "teal",
                    cursor: "pointer",
                  }}
                  onClick={() => memodCosineFunction()}
                ></SendIcon>
              ) : (
                <></>
              )}
              {/* <Button
                sx={{
                  position: "absolute",
                  right: "0ch",
                  // left: "10ch",
                  // top: "auto",
                  // bottom: "auto",
                  height: "100%",
                  outline: "2px red solid",
                  zIndex: "99999",
                }}
                variant="contained"
                onClick={() => cosineDistance()}
              >
                TELL
              </Button> */}
            </Stack>
            {/* <button className="buttonSubmit bg-secondary text-primary-light-2  text-hover-tertiary-light-1  ">
              Number 2 tell
            </button> */}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction="column"
          sx={{
            height: "100vh",
            justifyContent: "center",
            // alignItems: "center",
            width: {
              xs: "90%",
              lg: "30%",
            },
            alignSelf: "center",
          }}
        >
          <Stack
            direction="column"
            spacing={1}
            sx={{ alignItems: "center" }}
            // sx={{ alignSelf: "center", alignItems: "center" }}
          >
            <LinearProgress
              sx={{
                width: "100%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "80%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "40%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "20%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "5%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
          </Stack>

          <Typography
            sx={{
              alignSelf: "center",
              color: "white",
              letterSpacing: "0.5ch",
              fontWeight: "700",
              fontSize: "2ch",
              marginTop: "2ch",
              marginBottom: "2ch",
              fontFamily: "'Orbitron', sans-serif",
              textAlign: "center",
            }}
            variant="h4"
          >
            WAKING UP THE BOT
          </Typography>
          <Stack
            direction="column"
            spacing={1}

            // sx={{ alignSelf: "center", alignItems: "center" }}
          >
            <LinearProgress
              sx={{
                backgroundColor: "teal",
                width: "5%",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                backgroundColor: "teal",
                width: "20%",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                backgroundColor: "teal",
                width: "40%",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "80%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            <LinearProgress
              sx={{
                width: "100%",
                backgroundColor: "teal",
                borderRadius: "100%",
                filter: "blur(0px)",
                alignSelf: "center",
              }}
            />
            {/* <LinearProgress sx={{ width: "20%", alignSelf: "center" }} />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="success"
            />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="secondary"
            /> */}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
