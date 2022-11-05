import mongoose from 'mongoose';
import userModel from './userModel.js';
import patchHistory from 'mongoose-patch-history';
import ticketModel from './ticketModel.js';
const projectSchema = new mongoose.Schema(
	{
		project_name: {
			type: String,
			required: true,
		},
		project_description: {
			type: String,
			required: true,
			//minlength: 6,
		},
		employees: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
			required: false,
		},
		tickets: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
			required: false,
		},
		project_owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
projectSchema.virtual('edited_by').set(function (edited_by) {
	this._edited_by = edited_by;
});
projectSchema.plugin(patchHistory.default, {
	mongoose,
	name: 'projectPatches',
	includes: {
		edited_by: {
			type: mongoose.Schema.Types.ObjectId,
			from: '_edited_by',
		},
	},
});

projectSchema.post('findOneAndDelete', async (document) => {
	const projId = document._id;
	userModel.find({ assigned_projects: { $in: [projId] } }).then((users) => {
		Promise.all(
			users.map(async (user) => {
				let projIndex = user.assigned_projects.indexOf(projId);
				if (projIndex > -1) {
					user.assigned_projects.splice(projIndex, 1);
				}
				user.save();
			})
		);
	});
	ticketModel.find({ project: document._id }).then((tickets) => {
		Promise.all(
			tickets.map(async (ticket) => {
				await ticketModel.findOneAndDelete({ _id: ticket._id });
			})
		);
	});
	await document.patches.deleteMany({ ref: document._id });
});

const model = mongoose.model('Project', projectSchema);

export default model;
