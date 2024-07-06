import React from "react";
import Box from "@mui/material/Box";
import MobileStepper from "@mui/material/MobileStepper";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface QuestionData {
  interactiveTitle: string;
  questions: Array<{
    text: string;
    answerKey: string;
  }>;
  answers: Array<{
    text: string;
    key?: string;
  }>;
}

interface PropType {
  src?: string;
}
interface StateType {
  langData: object;
  questionData: QuestionData;
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

  state = {
    langData: {},
    questionData: {
      interactiveTitle: "Data Load Failure",
      questions: [
        {
          text: "question",
          answerKey: "a",
        },
      ],
      answers: [
        {
          key: "a",
          text: "answer",
        },
      ],
    },
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

    this.getQuestionData().then((e) => console.log(e));
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

  render() {
    return (
      <div className="sortingInteractive">
        <h2> {this.state.questionData.interactiveTitle} </h2>
        <div className="instructionText">
          <p>
            <strong> Instructions: </strong> Select the arrow buttons to cycle
            for best response to the following statment.Once you have selected
            the best responce, check your answer with the button below.
          </p>
        </div>

        <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
          <Paper
            square
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 50,
              pl: 2,
              bgcolor: "background.default",
            }}
          >
            <Box
              dangerouslySetInnerHTML={{
                __html:
                  this.state.questionData.questions[this.state.currentQuestion]
                    .text,
              }}
            ></Box>
          </Paper>
          <Box
            sx={{ height: 255, maxWidth: 400, width: "100%", p: 2 }}
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
        </Box>
      </div>
    );
  }
}

export default IntractiveWrapper;
