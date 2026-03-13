import prisma from "../config/prismaclient.js";

// Get all published content
export const getAllContent = async () => {
  return await prisma.educationalContent.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
};

// Get single content by ID
export const getContentById = async (id) => {
  return await prisma.educationalContent.findUnique({
    where: { id },
  });
};

// Create new content (admin only)
export const createContent = async (data) => {
  return await prisma.educationalContent.create({ data });
};

// Update content (admin only)
export const updateContent = async (id, data) => {
  return await prisma.educationalContent.update({
    where: { id },
    data,
  });
};

// Delete content (admin only)
export const deleteContent = async (id) => {
  return await prisma.educationalContent.delete({
    where: { id },
  });
};

// Get content by category (optional - useful for filtering)
export const getContentByCategory = async (category) => {
  return await prisma.educationalContent.findMany({
    where: {
      category,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get all content including unpublished (admin only)
export const getAllContentAdmin = async () => {
  return await prisma.educationalContent.findMany({
    orderBy: { createdAt: "desc" },
  });
};
