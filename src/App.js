import Stack from "@mui/material/Stack";
import { Button, TextField, Typography } from "@mui/material";
import { userStatements, botQuestions } from "./dataset.js";
// import { personalBotQuestions, personalUserTexts } from "./dataset.js";
import { modelDataSet } from "./dataset.js";
import { useEffect, useState, useRef } from "react";
// import styles from "./App.module.css";
import leven from "leven";
import * as tf from "@tensorflow/tfjs";
import * as qna from "@tensorflow-models/qna";
import { diceCoefficient } from "dice-coefficient";
// import use from "@tensorflow-models/universal-sentence-encoder";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import styles from "./App.css";

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
    console.log("model has been loaded");
  };

  useEffect(() => {
    loadModel();
    // checkUserActivity();
    // var askButton = document.getElementById("askInput");
    // askButton.addEventListener("keypress", onEnterPress);

    // return () => {
    //   document.removeEventListener("keypress", onEnterPress);
    // };
  }, []);

  useEffect(() => {
    console.log("qustion  : ", question);
  }, [question]);

  async function cosineDistance() {
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
      // setList((prevState)=> [
      //   ...list,
      //   question.toLowerCase(),
      //   `a) Kindly keep the conversation related to veganism b) Stick to English since that is the only language I know c) Kindly include more words in your statements for more clarity  `,
      // ]);
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
        console.log(
          "distance for ",
          Object.keys(userStatements)[index - 1],
          " : ",
          tempDistance
        );

        if (tempDistance < minDistance) {
          minDistance = tempDistance;
          reply = userStatements[Object.keys(userStatements)[index - 1]];
        }

        if (index === embeddings.length - 1) {
          resolve();
        }
      });
    });

    foo.then(() => {
      if (reply === "ask the user a question") {
        // window.alert("user wants th bot to ask a question");
        console.log("indics length : ", botQuestionsIndices.current.length);
        console.log("bot questions length : ", botQuestions.length);
        if (botQuestionsIndices.current.length === botQuestions.length) {
          reply =
            // "I don't have anything left to ask you. I hope that my previous questions left you with insightful thoughts that can convince you to go vegan!";
            "I don't have anything left to ask you.";
        } else {
          console.log("bot questions : ", botQuestions);
          botQuestions.forEach((eachQuestion, index) => {
            let randomIndex = Math.floor(Math.random() * botQuestions.length);
            console.log("random index : ", randomIndex);
            if (!botQuestionsIndices.current.includes(randomIndex)) {
              reply = botQuestions[randomIndex];
              console.log("rarndom reply : ", reply);
              botQuestionsIndices.current.push(randomIndex);
            }
          });
        }
      }
      if (minDistance < 0.5) {
        // setList([...list, question, reply]);
        // setList([...list, reply]);
        setList((prevState) => [...prevState, reply]);
      } else {
        //statement is very far from all given data
        // setList([
        //   ...list,
        //   question,
        //   `( ${minDistance}) Kindly keep the conversation related to veganism  `,
        // ]);

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
      xs={3}
      className="App"
      style={{
        backgroundColor: "rgb(43, 42, 39)",
      }}
    >
      {model ? (
        <Stack
          direction="column"
          spacing={3}
          sx={{
            height: "100vh",
            justifyContent: "space-evenly",
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            sx={{
              // width: "50%",
              alignSelf: "center",
              width: { xs: "90%", md: "70%", lg: "50%" },
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Stack
              sx={{
                // background:
                //   "linear-gradient(to right, rgb(67,124,205), rgb(69,214,202))",
                background:
                  // "linear-gradient(to right, rgb(168, 60, 50), rgb(50, 168, 54))",
                  "linear-gradient(to right, rgb(168, 60, 50), rgb(125, 235, 52))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <Typography sx={{ fontWeight: "800", fontSize: "1.4rem" }}>
                Veganism chatbot
              </Typography>
            </Stack>

            {/* question */}
            <TextField
              id="askInput"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setUserLastActive(0);
              }}
              sx={{
                width: "100%",
                border: "none",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                backgroundColor: "lightgrey",
                borderRadius: "1ch",
                alignSelf: "center",
              }}
            ></TextField>
            {error ? <Alert severity="error">Type something</Alert> : <></>}

            <Button
              variant="contained"
              // onClick={() => findSuitableReply()}
              // onClick={() => correctReply()}
              onClick={() => cosineDistance()}
            >
              TELL
            </Button>
            {/* <button className="buttonSubmit bg-secondary text-primary-light-2  text-hover-tertiary-light-1  ">
              Number 2 tell
            </button> */}
          </Stack>

          <Stack
            direction="column"
            sx={{
              height: "70%",
              // width: "50%",
              width: { xs: "90%", md: "70%", lg: "50%" },
              backgroundColor: "lightgrey",
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
                    key={index}
                    sx={{
                      scrollSnapAlign: "end",
                      alignSelf: index % 2 === 0 ? "end" : "start",
                      marginRight: index % 2 === 0 ? "0ch" : "0ch",
                      marginLeft: index % 2 === 0 ? "0ch" : "1ch",
                      maxWidth: "50%",
                      backgroundColor: index % 2 === 0 ? "lightgreen" : "white",
                      color: index % 2 === 0 ? "black" : "black",
                      padding: "1ch",
                      borderRadius: "1ch",
                      marginBottom: "1ch",
                      wordWrap: "break-word",
                    }}
                  >
                    <Typography
                      // key={index}
                      sx={{
                        // scrollSnapAlign: "end",
                        // alignSelf: index % 2 === 0 ? "end" : "start",
                        // marginRight: index % 2 === 0 ? "0ch" : "0ch",
                        // marginLeft: index % 2 === 0 ? "0ch" : "1ch",
                        // maxWidth: "50%",
                        // backgroundColor:
                        //   index % 2 === 0 ? "lightgreen" : "white",
                        // color: index % 2 === 0 ? "black" : "black",
                        // padding: "1ch",
                        // borderRadius: "1ch",
                        // marginBottom: "1ch",
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
            {isProcessing === true ? (
              <Stack
                sx={{
                  justifySelf: "end",
                  marginLeft: "1ch",
                }}
              >
                <Typography
                  variant="subtitle"
                  sx={{
                    fontWeight: "600",
                    letterSpacing: "0.2ch",
                    color: "black",
                  }}
                >
                  *busy uttering magic spells*
                </Typography>
              </Stack>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction="column"
          sx={{
            height: "100vh",
            justifyContent: "center",
            // alignItems: "center",
          }}
        >
          {/* <Dna
            visible={true}
            height="80"
            width="80"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          /> */}

          <Stack
            direction="column"
            spacing={1}
            // sx={{ alignSelf: "center", alignItems: "center" }}
          >
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="secondary"
            />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="success"
            />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              // color="inherit"
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
            <LinearProgress sx={{ width: "20%", alignSelf: "center" }} />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="success"
            />
            <LinearProgress
              sx={{ width: "20%", alignSelf: "center" }}
              color="secondary"
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
