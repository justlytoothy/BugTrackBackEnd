import userModel from '../model/userModel.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const newUser = async (req, res) => {
	try {
		let { username, password, first_name, last_name, role } = req.body

		//Check for all input
		if (!(username && password && first_name && last_name && role)) {
			res.status(400).send('All fields are required')
		}

		//Check to see if already exists
		const check = await userModel.findOne({ username })
		if (check) {
			return res.status(400).send('User already exists, please login')
		}

		//Encrypt Password
		const hashedPwd = await bcryptjs.hash(password, 10)

		const user = await userModel.create({
			first_name: first_name,
			last_name: last_name,
			preferred_full_name: `${first_name} ${last_name}`,
			username: username.toLowerCase(),
			password: hashedPwd,
			role: role,
		})

		const token = jwt.sign(
			{ user_id: user._id, username },
			process.env.REACT_APP_TOKEN_KEY,
			{
				expiresIn: '4h',
			}
		)

		user.token = token
		return res.status(201).json(user)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ Error: err })
	}
}

const editUser = async (req, res) => {
	const { _id, firstName, lastName, prefName, role, editedBy } = req.body
	try {
		let user = await userModel.findById(_id)

		if (user.first_name !== firstName) {
			user.first_name = firstName
		}
		if (user.last_name !== lastName) {
			user.last_name = lastName
		}
		if (user.preferred_full_name !== prefName) {
			user.preferred_full_name = prefName
		}
		if (user.role !== role) {
			user.role = role
		}
		user.edited_by = editedBy //Set virtual for history saving
		await user.save()
		res.status(200).send()
	} catch (error) {
		console.log(error)
	}
}

const loginUser = async (req, res) => {
	try {
		let { username, password } = req.body
		if (!(username && password)) {
			return res.status(400).send('All input is required')
		}
		username = username.toLowerCase()
		let user = await userModel.findOne({ username })
		if (user.hasOwnProperty('preferred_full_name')) {
			if (user.preferred_full_name == null || user.preferred_full_name == '') {
				user.preferred_full_name = `${user.first_name} ${user.last_name}`
				await user.save()
			}
		} else {
			user.preferred_full_name = `${user.first_name} ${user.last_name}`
			await user.save()
		}
		user = await userModel.findOne({ username })

		if (user && (await bcryptjs.compare(password, user.password))) {
			const token = jwt.sign(
				{ user_id: user._id, username },
				process.env.REACT_APP_TOKEN_KEY,
				{
					expiresIn: '4h',
				}
			)
			user.token = token
			user.password = ''
			return res.status(200).json(user)
		} else {
			return res.status(400).send('Invalid Credentials')
		}
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}
const getUsers = async (req, res) => {
	try {
		const response = await userModel
			.find({})
			.populate('assigned_projects assigned_tickets')
			.exec()
		return res.json(response)
	} catch (error) {
		console.log(error)
		return res.json({ Error: error })
	}
}
const deleteUser = async (req, res) => {
	try {
		console.log('implement me')
		// const response = await userModel.findOneAndDelete({
		// 	_id: req.body.id,
		// });
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}

export default { newUser, editUser, loginUser, getUsers }
