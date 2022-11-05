import mongoose from 'mongoose'
import ticketModel from '../model/ticketModel.js'
import userModel from '../model/userModel.js'
import projectModel from '../model/projectModel.js'

const newTicket = async (req, res) => {
	const {
		project_id,
		ticket_name,
		ticket_description,
		ticket_status,
		ticket_type,
		ticket_steps,
		ticket_priority,
		assigned_employees,
		ticket_creator,
	} = req.body
	let ticket = ''
	try {
		const creator = await userModel.findById(ticket_creator)
		const project = await projectModel.findById(project_id)
		ticket = await ticketModel.create({
			ticket_name: ticket_name,
			ticket_description: ticket_description,
			ticket_creator: ticket_creator,
			ticket_status: ticket_status,
			project: project_id,
			ticket_type: ticket_type,
			ticket_steps: ticket_steps,
			ticket_priority: ticket_priority,
			assigned_employees: assigned_employees,
			edited_by: ticket_creator,
		})
		creator.created_tickets.push(ticket._id)
		creator.save()
		project.tickets.push(ticket._id)
		project.edited_by = ticket_creator
		project.save()
		let data = await userModel.find({ _id: { $in: assigned_employees } })
		data.forEach((emp) => {
			emp.assigned_tickets.push(ticket._id)
			emp.save()
		})
		return res.status(201).json(ticket)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ Error: err })
	}
}

const getAllProjectTickets = async (req, res) => {
	let id = req.query[0]
	const currProject = await projectModel.findById(id)
	const tickets = currProject.tickets
	try {
		const response = await ticketModel
			.find({
				_id: { $in: tickets },
			})
			.populate('comments')
			.exec()
		return res.json(response)
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}
const getAllUserTickets = async (req, res) => {
	let id = req.query[0]
	const currUser = await userModel.findById(id)
	const assigned_tickets = currUser.assigned_tickets
	try {
		const response = await ticketModel
			.find({
				_id: { $in: assigned_tickets },
			})
			.populate('comments')
			.exec()
		return res.json(response)
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}

const getTicket = async (req, res) => {
	const id = req.query[0]
	try {
		const ticket = await ticketModel
			.findById(id)
			.populate('assigned_employees ticket_comments ticket_creator')
			.populate({
				path: 'ticket_comments',
				populate: { path: 'creator' },
			})
			.exec()
		return res.status(200).json(ticket)
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}

const deleteTicket = async (req, res) => {
	try {
		const id = await ticketModel.findOneAndDelete({
			_id: req.body.id,
		})
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}

	// const ticketEmployees = await userModel.find({
	// 	assigned_tickets: id,
	// });
	// console.log(ticketEmployees);
}

export default {
	newTicket,
	getAllProjectTickets,
	getAllUserTickets,
	getTicket,
	deleteTicket,
}
