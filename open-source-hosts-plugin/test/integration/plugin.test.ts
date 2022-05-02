import { TestApp } from "./app";


describe("Editor - Add Plugin", () => {
    jest.setTimeout(600000);

    const testApp = new TestApp();

    beforeEach(async function() {
        await testApp.start();
        await testApp.loadWorkspace();
    });

    afterEach(async function() {
        await testApp.stop();
    });

    it("should show the Sumerian Host plugin in the menu when the plugin is added", async function() {
        await testApp.click("div=Edit");
        await testApp.click("div=Preferences...");


    });
});
