/*
This allows the image uploads from the uploads screen. I just followed this tutorial and copied the code from there: https://www.youtube.com/watch?v=QTD9L0jL0dU
 */
import { NextApiHandler, NextApiRequest } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

export const config = {
    api: {
        bodyParser: false,
    },
};
let url=""
const readFile = (
    req: NextApiRequest,
    saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const options: formidable.Options = {};
    if (saveLocally) {
        options.uploadDir = path.join(process.cwd(), "/public/user_images");
        options.filename = (name, ext, path, form) => {
            url=Date.now().toString() + "_" + path.originalFilename;
            return url;
        };
    }
    options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable(options);
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err){
                reject(err);
            }
            resolve({ fields, files });
        });
    });
};

const handler: NextApiHandler = async (req, res) => {
    try {
        await fs.readdir(path.join(process.cwd() + "/public", "/user_images"));
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/public", "/user_images"));
    }
    await readFile(req, true);
    res.json({ url: url});
};

export default handler;