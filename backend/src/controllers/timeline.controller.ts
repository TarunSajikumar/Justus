import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import TimelineEvent from '../models/TimelineEvent';
import User from '../models/User';

/**
 * GET /api/timeline
 * Returns all timeline events for the couple, sorted by date descending.
 * Query params: type (optional filter)
 */
export const getTimelineEvents = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user?.couple_id) {
      return res.status(403).json({ message: 'You must be in a relationship to view the timeline' });
    }

    const filter: any = { couple_id: user.couple_id };
    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }

    const events = await TimelineEvent.find(filter).sort({ date: -1 });

    return res.json({
      events: events.map((e) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        type: e.type,
        created_at: e.createdAt,
        updated_at: e.updatedAt,
      })),
    });
  } catch (error) {
    console.error('getTimelineEvents error:', error);
    return res.status(500).json({ message: 'Failed to load timeline' });
  }
};

/**
 * POST /api/timeline
 * Create a new timeline event.
 * Body: { title, description?, date, type }
 */
export const createTimelineEvent = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { title, description, date, type } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }
  if (!date) {
    return res.status(400).json({ message: 'date is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user?.couple_id) {
      return res.status(403).json({ message: 'You must be in a relationship to create timeline events' });
    }

    const event = await TimelineEvent.create({
      couple_id: user.couple_id,
      created_by: userId,
      title: title.trim(),
      description: description?.trim() || '',
      date: new Date(date),
      type: type || 'custom',
    });

    return res.status(201).json({
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        type: event.type,
        created_at: event.createdAt,
      },
    });
  } catch (error) {
    console.error('createTimelineEvent error:', error);
    return res.status(500).json({ message: 'Failed to create event' });
  }
};

/**
 * PUT /api/timeline/:id
 * Update a timeline event (only by couple members).
 */
export const updateTimelineEvent = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { title, description, date, type } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user?.couple_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const event = await TimelineEvent.findOne({ _id: id, couple_id: user.couple_id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (title?.trim()) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (date) event.date = new Date(date);
    if (type) event.type = type;

    await event.save();

    return res.json({
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        type: event.type,
        created_at: event.createdAt,
        updated_at: event.updatedAt,
      },
    });
  } catch (error) {
    console.error('updateTimelineEvent error:', error);
    return res.status(500).json({ message: 'Failed to update event' });
  }
};

/**
 * DELETE /api/timeline/:id
 * Delete a timeline event (only by couple members).
 */
export const deleteTimelineEvent = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user?.couple_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const event = await TimelineEvent.findOneAndDelete({ _id: id, couple_id: user.couple_id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('deleteTimelineEvent error:', error);
    return res.status(500).json({ message: 'Failed to delete event' });
  }
};
