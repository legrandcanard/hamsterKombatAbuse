const hkAutomationUtility = {
    
    heartbeat: null,
    nextBatchTimeout: null,
    appState: null,
    waitStartDateMs: 0,
    waitDurationMs: 0,
    
    initDeviceRestrictionBypass() {
        const originalIndexOf = Array.prototype.indexOf;
        const that = this;
        that.log("Device check pending...");
        Array.prototype.indexOf = function (...args) {
            if(JSON.stringify(this) === JSON.stringify(["android", "android_x", "ios"])) {
                setTimeout(() => {
                    Array.prototype.indexOf = originalIndexOf;
                })
                that.log("Device check complete.");
                return 0;
            }
            return originalIndexOf.apply(this, args);
        }
    },
    init(options) {
        this.log("Setup...");
        this.initDeviceRestrictionBypass();
        this.token = options.token;
        this.url = options.url;
        this.log("Setup complete.");
    },
    start() {
        this.heartbeat = setTimeout(this.onHeartbeat.bind(this), 1000);
        this.log("Running.");
    },
    stop() {
        clearTimeout(this.heartbeat);
        clearTimeout(this.nextBatchTimeout);
        this.log("Terminated.");
    },
    isDocumentContentPresent() {
        return !!document.querySelector(".user-tap-energy p");
    },
    async initAppState() {
        this.appState = await this.getCurrentAppState(); 
    },
    log(text){
        console.log("[HK Automation Utility] " + text);
    },
    async onHeartbeat() {
        if (this.waitStartDateMs !== 0)
            this.log(`Remaining waiting time: ${Math.floor((this.waitDurationMs - (Date.now() - this.waitStartDateMs)) / 1000)} s`);
        
        // First init
        if (this.appState === null) {
            if (this.isDocumentContentPresent()) {
                await this.initAppState();
                this.sheduleBatch();
            }
        }
        
        this.heartbeat = setTimeout(this.onHeartbeat.bind(this), 1000);
    },
    sheduleBatch() {
        clearTimeout(this.nextBatchTimeout);
        this.waitStartDateMs = 0;
        
        const nextTapsCount = this.getNextTapsCount(10, Math.floor(this.appState.maxTaps / this.appState.earnPerTap) - 1);
        
        // Wait for full charge
        const msToWait = Math.floor((this.appState.maxTaps - this.appState.availableTaps) / this.appState.tapsRecoverPerSec /* should be 3 */ * 1000) + 1000 /* extra time */;
        
        this.log("Energy: " + this.appState.availableTaps);
        this.log(`Waiting ${msToWait / 1000} s for recharge. Prepare to send ${nextTapsCount} taps.`);
        
        this.waitStartDateMs = Date.now();
        this.waitDurationMs = msToWait;
        
        this.nextBatchTimeout = setTimeout(async () => await this.processBatch(nextTapsCount), msToWait);
    },
    async processBatch(nextTapsCount) {
        this.log(`Sending request for ${nextTapsCount} taps...`);
        
        const availableTaps =  this.appState.maxTaps - (nextTapsCount * this.appState.earnPerTap);
        
        this.appState = await this.sendTapRequest(nextTapsCount, availableTaps);
        
        this.log(`Sent ${nextTapsCount} taps.`);
        this.log(`New app state: ${JSON.stringify(this.appState)}`);
        
        this.sheduleBatch();
    },
    async sendTapRequest(count, availableTaps) {
        let response = await fetch(this.url + "/clicker/tap", {
            method: 'POST',
            headers: {
                "authorization": this.token,
                "content-type": 'application/json'
            },
            body: JSON.stringify({ 
                "count": count,
                "availableTaps": availableTaps,
                "timestamp": Date.now()
            })
        });
        let data = await response.json();
        return data.clickerUser;
    },
    async getCurrentAppState() {
        let response = await fetch(this.url + "/clicker/sync", {
            method: 'POST',
            headers: {
                "authorization": this.token,
                "content-type": 'application/json'
            }
        });
        let data = await response.json();
        return data.clickerUser;
    },
    getNextTapsCount(min, max) {
        return max - Math.floor(Math.random() * (max - min));
    }
}

hkAutomationUtility.init({
    token: "<enter auth token here>",
    url: "<enter current API url here>",
});
hkAutomationUtility.start();
