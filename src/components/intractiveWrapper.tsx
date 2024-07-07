import React from "react";
import "./sortingIntractive.scss";
import deepcopy from "deepcopy";

import Box from "@mui/material/Box";
import MobileStepper from "@mui/material/MobileStepper";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface QuestionsData {
  text: string;
  answerKey: string;
  feedback: string;
}

interface AnswersData {
  text: string;
  key?: string;
}

interface QuestionData {
  interactiveTitle: string;
  questions: Array<QuestionsData>;
  answers: Array<AnswersData>;
}

interface PropType {
  src?: string;
}
interface StateType {
  langData: object;
  questionData: QuestionData;
  displayState: string;
  currentQuestion: number;
  activeStep: number;
}

class IntractiveWrapper extends React.Component<PropType, StateType> {
  ref: any = null;
  usingDataSrc: string = "";
  supportedLangs: Array<string> = ["en", "fr-ca"];
  defaultLang: string = "en";
  langSelection: string = this.defaultLang;
  stepperSteps: Array<{ label: string; description: string }> = [];
  correctResponce: boolean = false;
  score: number = 0;

  state = {
    langData: {},
    questionData: {
      interactiveTitle: "Data Load Failure",
      questions: [
        {
          text: "question",
          answerKey: "a",
          feedback: "",
        },
      ],
      answers: [
        {
          key: "a",
          text: "answer",
        },
      ],
    },
    displayState: "question",
    currentQuestion: 0,
    activeStep: 0,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    this.getLangData();
    console.log("MpsPlayer ready");

    if ((window as any).si_srcOverride) {
      this.usingDataSrc = (window as any).si_srcOverride as string;
    }
    if ((window as any).parent && (window as any).parent.si_srcOverride) {
      this.usingDataSrc = (window as any).parent.si_srcOverride as string;
    } else if (this.props.src) {
      this.usingDataSrc = this.props.src;
    } else {
      this.usingDataSrc = "./sample.json";
    }

    this.getQuestionData().then(() => {
      this.shuffleAnswerData().then(() => {
        this.shuffleAnswerData();
      });
    });
  };

  getLangData = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).si_langOverride) {
        if (
          this.supportedLangs.indexOf((window as any).si_langOverride) === -1
        ) {
          this.langSelection = (window as any).si_srcOverride as string;
        } else {
          console.warn(
            `provided lang overide ${
              (window as any).si_srcOverride
            } is not availible`
          );
        }
      }

      fetch(`./lang/${this.langSelection}.json`)
        .then((response) => response.json())
        .then((publicLangData: object) => {
          this.setState(
            {
              langData: publicLangData,
            },
            () => {
              resolve(this.state.langData);
            }
          );
        });
    });
  };

  getQuestionData = () => {
    return new Promise((resolve, reject) => {
      fetch(this.usingDataSrc)
        .then((response) => response.json())
        .then((publicQuestionData: QuestionData) => {
          this.setState(
            {
              questionData: publicQuestionData,
            },
            () => {
              resolve(this.state.questionData);
            }
          );
        });
    });
  };

  shuffleAnswerData = () => {
    return new Promise((resolve, reject) => {
      // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
      let qDataCopy = deepcopy(this.state.questionData);
      let array = qDataCopy.answers;
      let currentIndex = array.length;
      while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      qDataCopy.answers = array;

      this.setState(
        {
          questionData: qDataCopy,
        },
        () => {
          resolve(array);
        }
      );

      return array;
    });
  };

  langKey = (key: string) => {
    return this.state.langData[key] as string;
  };

  defineStepper = () => {
    this.stepperSteps = [];
    for (let ans = 0; ans < this.state.questionData.answers.length; ans++) {
      this.stepperSteps.push({
        label:
          this.state.questionData.questions[this.state.currentQuestion].text,
        description: this.state.questionData.answers[ans].text,
      });
    }
  };

  handleNextStep = () => {
    this.setState({ activeStep: this.state.activeStep + 1 });
  };

  handlePreviousStep = () => {
    this.setState({ activeStep: this.state.activeStep - 1 });
  };

  handleAnswerSelection = () => {
    this.correctResponce =
      this.state.questionData.answers[this.state.activeStep].key ===
      this.state.questionData.questions[this.state.currentQuestion].answerKey;
    this.setState({ displayState: "feedback" });
  };

  handleNextQuestionSelection = () => {
    if (
      this.state.currentQuestion + 1 >=
      this.state.questionData.questions.length
    ) {
      this.setState({
        currentQuestion: 0,
        displayState: "end",
        activeStep: 0,
      });
    } else {
      this.setState({
        currentQuestion: this.state.currentQuestion + 1,
        displayState: "question",
        activeStep: 0,
      });
    }
  };

  handleReset = () => {
    this.shuffleAnswerData();
    this.score = 0;
    this.setState({
      displayState: "question",
    });
  };

  render() {
    const buildQuestionDisplayState = () => {
      return (
        <Box className="si_questionDisplay">
          <Box className="si_questionText">
            <h3>
              Question {this.state.currentQuestion + 1} of{" "}
              {this.state.questionData.questions.length}
            </h3>
            <Box
              dangerouslySetInnerHTML={{
                __html:
                  this.state.questionData.questions[this.state.currentQuestion]
                    .text,
              }}
            ></Box>
          </Box>
          <hr />
          <Box
            className="si_answerText"
            dangerouslySetInnerHTML={{
              __html:
                this.state.questionData.answers[this.state.activeStep].text,
            }}
          ></Box>
          <MobileStepper
            variant="text"
            steps={this.state.questionData.answers.length}
            position="static"
            activeStep={this.state.activeStep}
            nextButton={
              <Button
                size="small"
                onClick={this.handleNextStep}
                disabled={
                  this.state.activeStep ===
                  this.state.questionData.answers.length - 1
                }
              >
                Next <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={this.handlePreviousStep}
                disabled={this.state.activeStep === 0}
              >
                <KeyboardArrowLeft /> Back
              </Button>
            }
          />
          <Button
            variant="contained"
            size="medium"
            onClick={this.handleAnswerSelection}
          >
            Select Answer
          </Button>
        </Box>
      );
    };

    const buildFeedbackDisplayState = () => {
      const correctStatusDisplay = () => {
        if (this.correctResponce) {
          this.score++;
          return (
            <Box className="si_isCorrectIndicator si_correct">Correct!</Box>
          );
        } else {
          return (
            <Box className="si_isCorrectIndicator si_incorrect">Incorrect</Box>
          );
        }
      };

      return (
        <Box className="si_feedbackDisplay">
          {correctStatusDisplay()}
          <p>
            {
              this.state.questionData.questions[this.state.currentQuestion]
                .feedback
            }
          </p>
          <Button
            variant="contained"
            size="medium"
            onClick={this.handleNextQuestionSelection}
          >
            Next Question
          </Button>
        </Box>
      );
    };

    const buildEndScreenDisplayState = () => {
      return (
        <Box className="si_endScreenDisplay">
          <p>
            Congratulations! You've scored {this.score} of{" "}
            {this.state.questionData.questions.length}
          </p>
          <Button variant="contained" size="medium" onClick={this.handleReset}>
            Reset
          </Button>
        </Box>
      );
    };

    const setDisplayState = () => {
      if (this.state.displayState === "question") {
        return <div>{buildQuestionDisplayState()}</div>;
      } else if (this.state.displayState === "feedback") {
        return <div>{buildFeedbackDisplayState()}</div>;
      } else if (this.state.displayState === "end") {
        return <div>{buildEndScreenDisplayState()}</div>;
      } else {
        console.error(`invaild display state ${this.state.displayState}`);
      }
    };

    return (
      <Box className="sortingInteractive">
        <h2 className="si_header">
          {this.state.questionData.interactiveTitle}
        </h2>

        <div className="instructionText">
          <p>
            <strong> Instructions: </strong> Select the arrow buttons to cycle
            for best response to the following statment.Once you have selected
            the best responce, check your answer with the button below.
          </p>
        </div>
        {setDisplayState()}
      </Box>
    );
  }
}

export default IntractiveWrapper;
