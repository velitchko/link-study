export const SURVEY_JSON = {
    firstPageIsStarted: true,
    showPrevButton: false,
    showProgressBar: "bottom",
    showQuestionNumbers: "off",
    fitToContainer: true,
    widthMode: "static",
    width: "100%",
    pages: [
        {
            name: "intro",
            elements: [
                {
                    type: "html",
                    name: "question_intro",
                    html: `<h3>Start</h3>
                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>
                            <b>Network visualizations show connections between entities, called edges and nodes respectively.</b> 
                            Network visualizations are used across application domains. For example, in social network analysis, nodes represent people and edges represent their relationship(s), such as colleagues or friends. 
                        </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>Overall, we estimate the study to require 45-60 minutes of your time. Your participation is voluntary, and you can decide to cancel your participation at any time. In order to participate in this study, please ensure that:</p>
                    <ul style="list-style-type: disc; padding-left: 2rem;">
                        <li>You are using a large desktop or laptop monitor, i.e. not a smartphone or tablet.</li>
                        <li>You do not navigate forth and back using the browser controls or refresh the page.</li>
                    <ul>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                    <p>
                    The study itself consists of the following:

                    <ol style="list-style-type: decimal; padding-left: 2rem;">
                        <li>Six tasks that you will be asked to complete as quickly and accurately as possible</li>
                        <li>A set of questions to provide qualitative feedback, thoughts, and comments.</li>
                    </ol>
                    </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>We will store the following information if you finish the study:</p>
                        <ul style="list-style-type: disc; padding-left: 2rem;">
                            <li>Your input to the text answer fields during the tasks</li>
                            <li>Your preferences and feedback at the end of the study</li>
                        </ul>
                    </div>

                    <div style="text-align: justify">
                        <p>If you cancel the study at any time, your data will not be used. All collected data will be fully anonymous. Data will be temporarily stored on a university server, hosted by the research unit conducting the study, and moved to a university-hosted data repository directly after the study. Only the principal investigators of the study and the administrators of the university’s research unit have access to the data. The collected anonymous data and the findings derived therefrom will be used for a publication on network readability. For any further questions, you can contact the principal investigators of this study.</p>
                    </div>
                    `
                },
                {
                    type: "checkbox",
                    name: "question_intro_confirm",
                    title: "I confirm that I understand what is expected from me.",
                    choices: ["I confirm"],
                    isRequired: true,
                },
                {
                    type: "checkbox",
                    name: "question_intro_agree",
                    title: "I understand and agree with the data handling policy.",
                    choices: ["I confirm"],
                    isRequired: true,
                }
            ]
        },
        {
            name: "tutorial",
            elements: [
                {
                    type: "html",
                    name: "question_tutorial",
                    html: `<h3>Tutorial</h3>
                    <div style="padding-top: 2em; padding-bottom: 2em; text-align: justify">
                        <p>
                            <b>Tutorial 1: Entering Numeric Answers</b>
                        </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>
                            For tasks that ask for a number, just type your answer into the text box provided below the question.
                        </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>
                            <b>Tutorial 2: Selecting Nodes
                            </b>
                        </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>For tasks that ask you to select one or more nodes, Left Click selects a single node and Ctrl (or Cmd)+Click can be used to select multiple nodes.</p>
                        <img src="./assets/click.gif" alt="Clicking on nodes" style="width: 100%; max-width: 600px; height: auto; padding-top: 1em; padding-bottom: 1em;">
                    </div>

                    <div style="text-align: justify">
                        <p>
                            <b>Tutorial 3: Selecting the Largest Cluster
                            </b>
                        </p>
                    </div>

                    <div style="padding-bottom: 2em; text-align: justify">
                        <p>For tasks that ask you to find the largest cluster, use Ctrl + Drag to select or deselect groups of nodes.</p>
                        <img src="./assets/lasso.gif" alt="Dragging to select nodes" style="width: 100%; max-width: 600px; height: auto; padding-top: 1em; padding-bottom: 1em;">
                    </div>
                    `
                },
                {
                    type: "checkbox",
                    name: "question_intro_confirm",
                    title: "I confirm that I understand what is expected from me.",
                    choices: ["I confirm"],
                    isRequired: true,
                },
                {
                    type: "checkbox",
                    name: "question_intro_agree",
                    title: "I understand and agree with the data handling policy.",
                    choices: ["I confirm"],
                    isRequired: true,
                }
            ]
        },
    ]
};
