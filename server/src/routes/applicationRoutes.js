import express from 'express';

import Application from '../models/Application.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { company, role, status, type, location, salary, notes, dateApplied, interviewDate } = req.body;

  if (!company || !role) {
    return res.status(400).json({ message: 'Company and role are required' });
  }

  try {
    const application = await Application.create({
      user: req.user.id,
      company,
      role,
      status,
      type,
      location,
      salary,
      notes,
      dateApplied,
      interviewDate,
    });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create application', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user.id });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    Object.assign(application, req.body);
    await application.save();

    return res.json(application);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedApp = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deletedApp) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete application', error: error.message });
  }
});

export default router;
