import {KeyboardEventTypes} from '@babylonjs/core';
import {Node} from '@babylonjs/core/node';
import {onKeyboardEvent, visibleInInspector} from '../decorators';
import SumerianHostScript from './SumerianHostScript';

/**
 * This simple script will cause a host character to speak when the "t" key
 * is pressed. To use, attach this script to a dummy node in your scene, fill
 * in the "Host Mesh" value to match the name of the character object, and
 * (optionally) change the "Speech Text" value.
 *
 * Note, when your scene is running it must have focus for keypresses to be
 * detected. If a keypress doesn't seem to be working, try clicking on the scene
 * and then pressing the key again.
 */
export default class HelloWorldScript extends Node {
  // @ts-ignore DO NOT EDIT this empty constructor!
  protected constructor() {}

  /**
   * The name of the host character object.
   */
  @visibleInInspector('string', 'Host Mesh', '')
  public hostNodeName: string;

  /**
   * The text that should be spoken.
   */
  @visibleInInspector('string', 'Speech Text', 'Hello, world!')
  public speechText: string;

  @onKeyboardEvent('t', KeyboardEventTypes.KEYDOWN)
  protected onSpeakKeyDown(): void {
    const node = this.getScene().getNodeByName(this.hostNodeName);
    const hostNode = node as SumerianHostScript;
    hostNode.host.TextToSpeechFeature.play(this.speechText);
  }
}
