import cloudinary from "../config/cloudinary.js";

/* =========================
   UPLOAD IMAGE TO CLOUDINARY
   ========================= */
export const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "real_estate/properties",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      )
      .end(buffer);
  });
};

/* =========================
   DELETE IMAGE FROM CLOUDINARY
   ========================= */
export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};
