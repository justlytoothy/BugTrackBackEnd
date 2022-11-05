import mongoose from 'mongoose'

const schema = mongoose.Schema({
	name: String,
	password: String,
	role: String,
})

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		first_name: {
			type: String,
		},
		last_name: {
			type: String,
		},
		preferred_full_name: {
			type: String,
		},
		token: {
			type: String,
		},
		role: {
			type: String,
		},
		assigned_projects: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
			required: false,
		},
		created_tickets: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
			required: false,
		},
		assigned_tickets: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
			required: false,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
)

userSchema.post('findOneAndDelete', (document) => {
	const userId = document._id
	projectModel.find({ employees: { $in: [userId] } }).then((projects) => {
		Promise.all(
			projects.map((project) =>
				projectModel.findOneAndUpdate(
					project._id,
					{ $pull: { employees: userId } },
					{ new: true }
				)
			)
		)
	})
})

const model = mongoose.model('User', userSchema)

export default model
