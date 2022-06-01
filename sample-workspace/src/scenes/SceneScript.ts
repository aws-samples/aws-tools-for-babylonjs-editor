import { Node } from "@babylonjs/core/node";
import { fromScene, visibleInInspector } from "./decorators";
import SumerianHostScript from "./SumerianHostScript";
import * as AWS from 'aws-sdk';
import { aws as AwsFeatures } from '@amazon-sumerian-hosts/babylon';
import { showUiScreen } from './domUtils';
import IAwsConnector from "./IAwsConnector";

/**
 * This script defines the main logic of our demo.
 */
export default class SceneScript extends Node {

    // ==== Inspectable parameters ====

    /**
     * The name of the Lex chatbot to use.
     */
    @visibleInInspector('string', 'Bot Name', 'BookTrip')
    public botName = '';

    /**
     * The version alias of the Lex chatbot to use.
     */
    @visibleInInspector('string', 'Bot Alias', 'Dev')
    public botAlias = '';
        
    // ==== Injected property values ====

    @fromScene('AWSConnector')
    public awsConnector: IAwsConnector;
    
    @fromScene('SumerianHost')
    protected hostScript: SumerianHostScript;

    // ==== Class properties ====

    protected lex: AwsFeatures.LexFeature;

    protected messageContainerEl: HTMLElement;

    protected transcriptTextEl: HTMLElement;

    /**
     * Override constructor.
     * @warn do not fill.
     */
    // @ts-ignore ignoring the super call as we don't want to re-init
    protected constructor() { }

    /**
     * Called automatically when the scene starts, after inspectable property
     * values are ready.
     */
    public onStart(): void {
        this.hostScript.onHostReadyObserver.add(() => {
            this.initChatbot();
            this.initConversationManagement();
            this.initUi();
            this.acquireMicrophoneAccess();
        });
    }

    /**
     * Initializes UI and user interactions.
     */
    protected initUi(): void {
        const isRunningInViewport = window.location.host === '';
        if (isRunningInViewport) {
            alert("Due to limitations of the Babylon.JS Editor, this demo can not be run from " +
                "the Preview panel. Instead, use any of the options from the \"Run\" menu.");
            return;
        }

        // Set up interactions for UI buttons.
        document.getElementById('startButton').onclick = () => this.startMainExperience();
        document.getElementById('enableMicButton').onclick = () => this.acquireMicrophoneAccess();

        // Use talk button events to start and stop recording.
        const talkButton = document.getElementById('talkButton');
        talkButton.onmousedown = () => {
            this.lex.beginVoiceRecording();
        };
        talkButton.onmouseup = () => {
            this.lex.endVoiceRecording();
        };

        // Create convenience references to DOM elements.
        this.messageContainerEl = document.getElementById('userMessageContainer');
        this.transcriptTextEl = document.getElementById('transcriptText');
    }

    /**
     * Defines logic that provides user feedback during the conversation flow.
     */
    protected initConversationManagement(): void {
        // Use events dispatched by the LexFeature to present helpful user messages.
        const {EVENTS} = AwsFeatures.LexFeature;
        this.lex.listenTo(EVENTS.lexResponseReady, response =>
            this.handleLexResponse(response)
        );
        this.lex.listenTo(EVENTS.recordBegin, () => this.hideUserMessages());
        this.lex.listenTo(EVENTS.recordEnd, () => this.displayProcessingMessage());
    }

    /**
     * Initializes the Lex chatbot.
     */
    protected initChatbot(): void {
        AWS.config.region = this.awsConnector.getRegion();
        AWS.config.credentials = this.awsConnector.getCredentials();

        // Initialize chatbot access. If you'd like to use this demo with a different chatbot, just change the
        // botName and botAlias values below.
        const lexClient = new AWS.LexRuntime();
        const botConfig = {
            botName: this.botName,
            botAlias: this.botAlias
        };

        this.lex = new AwsFeatures.LexFeature(lexClient, botConfig);
    }

    /**
     * Triggered when the user clicks the initial "start" button.
     */
    protected startMainExperience(): void {
        showUiScreen('chatbotUiScreen');

        // Speak a greeting to the user.
        this.hostScript.host.TextToSpeechFeature.play(
            `Hello. How can I help?  You can say things like, "I'd like to rent a car," or, "Help me book a hotel".`
        );
    }

    /**
     * Triggered whenever a response is received from the Lex chatbot.
     * 
     * @param {object} response An object representing the Lex response. For a
     * detailed description of this object's shape, see the documentation for the
     * "data" callback argument described here:
     * {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexRuntime.html#postContent-property}
     */
    protected handleLexResponse(response) {
        console.log(response);
        // Remove "processing" CSS class from message container.
        this.messageContainerEl.classList.remove('processing');

        // Display the user's speech input transcript.
        this.displaySpeechInputTranscript(response.inputTranscript);

        // Have the host speak the response from Lex.
        this.hostScript.host.TextToSpeechFeature.play(response.message);
    }

    protected displaySpeechInputTranscript(text) {
        this.transcriptTextEl.innerText = `“${text}”`;
        this.messageContainerEl.classList.add('showingMessage');
    }

    protected displayProcessingMessage() {
        this.messageContainerEl.classList.add('processing');
    }

    protected hideUserMessages() {
        this.messageContainerEl.classList.remove('showingMessage');
    }

    /**
     * Attempts to enable microphone access for Lex, triggering a browser permissions
     * prompt if necessary.
     * @returns {Promise} A Promise which resolves once mic access is allowed or
     * denied by the user or browser.
     */
    protected async acquireMicrophoneAccess() {
        showUiScreen('micInitScreen');

        try {
            await this.lex.enableMicInput();
            showUiScreen('startScreen');
        } catch (e) {
            // The user or browser denied mic access. Display appropriate messaging
            // to the user.
            if (e.message === 'Permission dismissed') {
                showUiScreen('micPermissionDismissedScreen');
            } else {
                showUiScreen('micDisabledScreen');
            }
        }
    }
}


