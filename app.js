// Product Sorter
// npm install --save @optimizely/optimizely-sdk

const optimizelySdk = require('@optimizely/optimizely-sdk');
const DEBUG_TEXT_ON = '[DEBUG: Feature [36mON[0m]';
const DEBUG_TEXT_OFF = '[DEBUG: Feature [33mOFF[0m]';
optimizelySdk.setLogger(optimizelySdk.logging.createLogger());
optimizelySdk.setLogLevel('debug'); 


/**
 * getExperience
 *
 * @param {Object} optimizely client instance exposing apis like Decide
 * @param {string} userId visitor's userId. Optimizely hashes the userId to determine
 *    what variation a user is bucketed into.
 *
 * @returns {Object} Information from the result of calling Optimizely's APIs
 */
function getExperience(optimizely, userId) {
  // Create a user and decide a flag rule (such as an A/B test) for them
  const user = optimizely.createUserContext(userId);
  const decision = user.decide('test_error123');

  let text;

  const isEnabled = decision.enabled;

  // the text that is printed comes from feature variables
  if (isEnabled) {
    text = decision.variables['sort_method'];
    // Default fallback if flag off for user
  } else {
    text = 'Flag off. User saw the product list sorted alphabetically by default.';
  }

  return {
    text: text,
    isEnabled: isEnabled,
    debugText: isEnabled ? DEBUG_TEXT_ON : DEBUG_TEXT_OFF,
  };
}

const customLogger = logger => (level, message) => {
    var LOG_LEVEL = optimizelySdk.enums.LOG_LEVEL;
    switch (level) {
      case LOG_LEVEL.INFO:
        // INFO log message
        console.log(message + type);
        break;
      
      case LOG_LEVEL.DEBUG:
        // DEBUG log message
        console.log(message + type);
        break;
  
      case LOG_LEVEL.WARNING:
        // WARNING log message
        console.log(message + type);
        break;
  
      case LOG_LEVEL.ERROR:
        // ERROR log message
        console.log(message + type);
        break;
    }
}

optimizelySdk.setLogger({
    log: customLogger,
});

async function main(optimizely) {

  // Generate random user ids to represent visitors
  // Each visitor will get randomly & deterministically bucketed into a flag variation
  const userIds = [];
  for (var i = 0; i < 50; i++) {
    let id = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    userIds.push(id.toString());
  }

  console.log('\n\nWelcome to our product catalog!');
  console.log('Let\'s see what product sorting the visitors experience!\n');

  // For each visitor, decide the feature flag experience they get
  const experiences = [];
  userIds.forEach(userId => {
    experiences.push(getExperience(optimizely, userId));
  });

  // Count how many visitors had the feature enabled
  const onVariations = experiences.reduce((accum, value) => {
    return (value.isEnabled) ? accum + 1 : accum
  }, 0)

  printLines(experiences, { debug: onVariations > 0 })

  // Count what experience each visitor got
  const freqMap = experiences.reduce((accum, value) => {
    accum[value.text] = accum[value.text] ? accum[value.text] + 1 : 1;
    return accum;
  }, {});

  let total = experiences.length;
  let percentage = Math.round(onVariations / total * 100);

  Object.keys(freqMap).forEach((text, index) => {
    if (index === 0) console.log('\n');
    let perc = Math.round(freqMap[text] / total * 100);
    console.log(`${freqMap[text]} visitors (~${perc}%) got the experience: '${text}'`)
  })

  console.log(`\n-------`);
}

const homepageLogger = {
    type: 'homepage',
    log: function(level, message){
        console.log(level, message, homepageLogger.type)
    }
}
function startApp() {
  // Initialize the SDK with the latest version of the datafile
  const optimizely = optimizelySdk.createInstance({
    sdkKey: '3GYTFWNzz5eya9187FWyx',
    datafileOptions: {
      autoUpdate: true,
      updateInterval: 1000,  // 1 second in milliseconds
      urlTemplate: 'https://cdn.optimizely.com/datafiles/%s.json',
    },
    logger: homepageLogger
  });

  function onUpdate(updateObject) {
    main(optimizely);
  }

  // Re-run the app if there are datafile updates, which result from any configuration updates you make to traffic percentage sliders, flag variable values, etc
  optimizely.notificationCenter.addNotificationListener(
    optimizelySdk.enums.NOTIFICATION_TYPES.OPTIMIZELY_CONFIG_UPDATE,
    onUpdate,
  );
}

startApp();

async function printLines(experiences, options) {
  experiences.forEach((experience, index) => {
    let preText = 'Visitor #' + index + ': ';
    let line = options.debug
      ? experience.debugText + ' ' + experience.text
      : experience.text

    console.log(preText + line);
  })
}