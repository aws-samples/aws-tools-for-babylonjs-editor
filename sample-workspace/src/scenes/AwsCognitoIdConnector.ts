import { Node } from "@babylonjs/core/node";
import { visibleInInspector } from "./decorators";
import * as AWS from 'aws-sdk';
import IAwsConnector from "./IAwsConnector";

export default class AwsCognitoIdConnector extends Node implements IAwsConnector {
    @visibleInInspector('string', 'Cognito Identity Pool ID', '')
    cognitoIdentityPoolId: string = '';

    /**
     * The AWS region to use when calling AWS services.
     */
    getRegion(): string | null {
        const cognitoId = this.cognitoIdentityPoolId.trim();
        if (AwsCognitoIdConnector.validateCognitoIdentityPoolId(cognitoId)) {
            return cognitoId.split(':')[0];
        }

        return null;
    }

    protected _credentials: AWS.Credentials | null = null;

    /**
     * The credentials to be used when calling AWS services.
     */
    getCredentials(): AWS.Credentials | null {
        // We're using lazy initialization of this property because there are
        // no BJS Editor lifecyle methods that would allow initialization to
        // happen *after* the Inspector-exposed "cognitoIdentityPoolId" value
        // has been injected but *before* other scripts may request this
        // property.
        if (!this._credentials) {
            const cognitoId = this.cognitoIdentityPoolId.trim();
            if (!AwsCognitoIdConnector.validateCognitoIdentityPoolId(cognitoId)) {
                alert(`You must set a valid Cognito Identity Pool ID on the "${this.name}" node.`);
                return null;
            }
            this._credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.cognitoIdentityPoolId
            });
        }

        return this._credentials;
    }

    /**
     * Override constructor.
     * @warn do not fill.
     */
    // @ts-ignore ignoring the super call as we don't want to re-init
    protected constructor() { }

    /**
     * Confirms whether the provided value is the the format of a valid 
     * Cognito Identity Pool ID.
     * 
     * @param value Any string
     * @returns true if the value is valid. Othewise, false.
     */
    static validateCognitoIdentityPoolId(value: string): boolean {
        const cognitoIdRegExp = /[a-z]+-[a-z]+-[0-9]:[a-f0-9-]+([\W]{1}|$)/g;
        return cognitoIdRegExp.test(value);
    }
}
