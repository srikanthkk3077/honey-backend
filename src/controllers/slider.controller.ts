import { Request, Response, NextFunction } from 'express';
import sliderService from '../services/slider.service';
import { sendSuccess, sendError } from '../utils/response';

export const getSliders = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const onlyActive = req.query.all !== 'true';
    const sliders = await sliderService.getAllSliders(onlyActive);
    return sendSuccess(res, 'Sliders retrieved successfully', sliders);
  } catch (error) {
    next(error);
  }
};

export const getSliderById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const slider = await sliderService.getSliderById(id);
    return sendSuccess(res, 'Slider retrieved successfully', slider);
  } catch (error) {
    next(error);
  }
};

export const createSlider = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { title, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return sendError(res, 'Title and image URL are required', 400);
    }
    const slider = await sliderService.createSlider(req.body);
    return sendSuccess(res, 'Slider created successfully', slider, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSlider = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const slider = await sliderService.updateSlider(id, req.body);
    return sendSuccess(res, 'Slider updated successfully', slider);
  } catch (error) {
    next(error);
  }
};

export const deleteSlider = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    await sliderService.deleteSlider(id);
    return sendSuccess(res, 'Slider deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
};
