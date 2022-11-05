import mongoose from 'mongoose';
import projectModel from '../model/projectModel.js';
import userModel from '../model/userModel.js';

const newProject = async (req, res) => {
	const { projName, projDesc, createdBy, employees } = req.body;
	let project = '';
	try {
		if (employees !== null) {
			project = await projectModel.create({
				project_name: projName,
				project_description: projDesc,
				project_owner: createdBy,
				edited_by: createdBy,
				employees: employees,
			});
		} else {
			project = await projectModel.create({
				project_name: first_name,
				project_description: projDesc,
				project_owner: createdBy,
			});
		}

		let data = await userModel.find({ _id: { $in: employees } });
		data.forEach((emp) => {
			emp.assigned_projects.push(project._id);
			emp.save();
		});
		return res.status(201).json(project);
	} catch (err) {
		console.log(err);
		return res.status(400).json({ Error: err });
	}
};
const editProject = async (req, res) => {
	const { project_id, projName, projDesc, editedBy, employees } = req.body;
	try {
		let project = await projectModel.findById(project_id);

		if (project.project_name !== projName) {
			project.project_name = projName;
		}
		if (project.project_description !== projDesc) {
			project.project_description = projDesc;
		}
		if (JSON.stringify(project.employees) !== JSON.stringify(employees)) {
			project.employees = employees;
		}
		project.edited_by = editedBy; //Set virtual for history saving
		project.save();
		await userModel.find({ _id: { $in: employees } }).then((emps) => {
			Promise.all(
				emps.map(async (emp) => {
					if (emp.assigned_projects.indexOf(project._id) === -1) {
						emp.assigned_projects.push(project._id);
						emp.save();
					}
				})
			);
		});

		await userModel
			.find({ assigned_projects: { $in: [project._id] } })
			.then((users) => {
				Promise.all(
					users.map(async (user) => {
						let projIndex = user.assigned_projects.indexOf(
							project._id
						);
						let inProject = false;
						employees.forEach((employee) => {
							if (
								JSON.stringify(employee) ===
								JSON.stringify(user._id)
							) {
								inProject = true;
							}
						});
						if (projIndex > -1 && !inProject) {
							user.assigned_projects.splice(projIndex, 1);
							user.save();
						}
					})
				);
			});
		return res.status(201).json(project);
	} catch (error) {
		console.log(error);
		return res.status(400).json({ Error: error });
	}
};

const getAllProjects = async (req, res) => {
	let id = req.query[0];
	const currUser = await userModel.findById(id);
	const assigned_projects = currUser.assigned_projects;
	try {
		const response = await projectModel
			.find({
				_id: { $in: assigned_projects },
			})
			.populate('employees')
			.populate({
				path: 'tickets',
				populate: { path: 'assigned_employees ticket_creator' },
			})
			.exec();
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(400).json({ Error: error });
	}
};

const getProject = async (req, res) => {
	const id = req.query[0];
	try {
		const project = await projectModel
			.findById(id)
			.populate('employees')
			.populate({
				path: 'tickets',
				populate: { path: 'assigned_employees ticket_creator' },
			})
			.exec();
		return res.status(200).json(project);
	} catch (error) {
		console.log(error);
		return res.status(400).json({ Error: error });
	}
};

const deleteProject = async (req, res) => {
	try {
		const id = await projectModel.findOneAndDelete({
			_id: req.body.id,
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({ Error: error });
	}
};

export default {
	newProject,
	editProject,
	getAllProjects,
	getProject,
	deleteProject,
};
