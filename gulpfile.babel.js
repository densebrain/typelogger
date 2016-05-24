require('source-map-support/register')


// Import gulp globally
Object.assign(global, {
	gulp: require('gulp')
})


// Include typeproject
require('typeproject/gulpfile.babel')

