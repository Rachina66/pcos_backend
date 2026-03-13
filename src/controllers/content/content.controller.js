import * as contentService from "../services/content.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";

export const getAllContent = async (req, res) => {
  try {
    const content = await contentService.getAllContent();
    return successResponse(res, content, "Content fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch content", 500, error.message);
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");
    return successResponse(res, content, "Content fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch content", 500, error.message);
  }
};

export const createContent = async (req, res) => {
  try {
    const { title, content, category, imageUrl, tags } = req.body;

    if (!title || !content || !category) {
      return errorResponse(
        res,
        "Title, content and category are required",
        400,
      );
    }

    const validCategories = [
      "PCOS_BASICS",
      "NUTRITION",
      "EXERCISE",
      "MENTAL_HEALTH",
      "TREATMENT",
      "LIFESTYLE",
    ];

    if (!validCategories.includes(category)) {
      return errorResponse(
        res,
        `Category must be one of: ${validCategories.join(", ")}`,
        400,
      );
    }

    // Parse tags array
    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : [];

    const newContent = await contentService.createContent({
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      tags: parsedTags,
    });

    return successResponse(
      res,
      newContent,
      "Content created successfully",
      201,
    );
  } catch (error) {
    return errorResponse(res, "Failed to create content", 500, error.message);
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");

    const updateData = { ...req.body };

    // Parse tags if provided
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags
        : updateData.tags.split(",").map((t) => t.trim());
    }

    const updated = await contentService.updateContent(
      req.params.id,
      updateData,
    );
    return successResponse(res, updated, "Content updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update content", 500, error.message);
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");

    await contentService.deleteContent(req.params.id);
    return successResponse(res, null, "Content deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete content", 500, error.message);
  }
};
