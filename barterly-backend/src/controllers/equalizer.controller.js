import * as equalizerService from "../services/equalizer.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const calculate = async (req, res, next) => {
  try {
    const result = await equalizerService.calculateEqualization({
      senderId: req.user._id,
      ...req.body,
    });
    return successResponse(res, 200, "Fair-trade proposal calculated", result);
  } catch (error) {
    next(error);
  }
};
