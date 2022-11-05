import mongoose from 'mongoose'
import userModel from '../model/userModel.js'
import ticketModel from '../model/ticketModel.js'

const newComment = async (req, res) => {
	const { ticket_id, message, creator } = req.body
	let comment = ''
	try {
		const ticket = await ticketModel.findById(ticket_id)
		ticket.ticket_comments.push({ message: message, creator: creator })
		ticket.save()
		return res.status(201).json(ticket)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ Error: err })
	}
}

const getAllComments = async (req, res) => {
	let ticket_id = req.query[0]
	try {
		const ticket = await ticketModel
			.findById(ticket_id)
			.populate('ticket_comments')
			.exec()
		return res.json(ticket)
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}

const getComment = async (req, res) => {
	const { ticket_id, comment_id } = req.query[0]
	try {
		const ticket = await ticketModel
			.findById(ticket_id)
			.populate('ticket_comments')
			.exec()
		const comment = await ticket.ticket_comments.id(comment_id)
		return res.status(200).json(comment)
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}
}

/**
 * finds ticket by ticket id and then deletes the comment from it by comment id
 * @param {*} req must pass both ticket and comment id
 * @param {*} res
 * @returns
 */
const deleteComment = async (req, res) => {
	const { ticket_id, comment_id } = req.body
	try {
		const ticket = await ticketModel.findById(ticket_id)
		const response = await ticket.ticket_comments.id(comment_id).remove()
	} catch (error) {
		console.log(error)
		return res.status(400).json({ Error: error })
	}

	// const commentEmployees = await userModel.find({
	// 	assigned_comments: id,
	// });
}

export default {
	newComment,
	getAllComments,
	getComment,
	deleteComment,
}
