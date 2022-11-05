import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import router from './routes/api.js'
import auth from './middleware/auth.js'
import https from 'https'
import fs from 'fs'

const app = express()
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/**
 * Connect to the Database
 */
mongoose.connect(
	process.env.REACT_APP_DB_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err) => {
		if (!err) {
			return console.log('Connected to database')
		} else {
			console.log(err)
		}
	}
)
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/**
 * Routing
 */
app.use('/', router)
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

const PORT = process.env.REACT_APP_PORT || 3500
if (process.env.CHECK == 'yes') {
	https
		.createServer(
			{
				key: fs.readFileSync(process.env.REACT_KEY_FILE),
				cert: fs.readFileSync(process.env.REACT_CRT_FILE),
			},
			app
		)
		.listen(3500, () => {
			console.log(`Server started on port ${PORT}`)
		})
} else {
	app.listen(PORT, () => {
		console.log(`Server started on ${PORT}`)
	})
}
