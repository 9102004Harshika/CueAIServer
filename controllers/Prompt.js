
import { PromptModel } from "../models/Prompt.js";
import { SignupModel } from "../models/Signup.js";
import mammoth from 'mammoth';

export const UpdatePrompt = async (req, res) => {
  const { promptId } = req.params;
  const {
    title,
    description,
    type,
    price,
    category,
    exampleInput,
    exampleOutput,
    model,
  } = req.body;
  const promptFile = req.file; // Multer will store file in req.file

  try {
    const existingPrompt = await PromptModel.findById(promptId);

    if (!existingPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    existingPrompt.title = title;
    existingPrompt.description = description;
    existingPrompt.type = type;
    existingPrompt.price = price;
    existingPrompt.category = category;
    existingPrompt.exampleInput = exampleInput;
    existingPrompt.exampleOutput = exampleOutput;
    existingPrompt.model = model;

    if (promptFile) {
      const { buffer, mimetype } = promptFile;

      try {
        const result = await mammoth.extractRawText({ buffer });
        console.log('Extracted text:', result.value); // Use this text if needed
      } catch (err) {
        console.error('Error extracting text from DOCX:', err);
      }

      existingPrompt.prompt = {
        data: buffer,
        contentType: mimetype,
      };
    }

    const updatedPrompt = await existingPrompt.save();
    res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const Create = async (req, res) => {
  const username = req.body.username;
  const { title, description, type, category, price, model, exampleInput, exampleOutput } = req.body;
  const promptFile = req.file; // Multer will store file in req.file

  try {
    console.log('Creating prompt with:', { username, title, description, type, category, price, model, exampleInput, exampleOutput });

    const user = await SignupModel.findOne({ fname: username });
    console.log('Found user:', user);

    if (user) {
      // Check for duplicate prompt
      const existingPrompt = await PromptModel.findOne({
        title,
        description,
        type,
        category,
        userId: user._id,
        price,
        model,
        exampleInput,
        exampleOutput
      });

      if (existingPrompt) {
        console.log('Duplicate prompt found');
        return res.status(409).json({ message: "Duplicate prompt exists" });
      }

      const createdDate = new Date();
      const newPrompt = new PromptModel({
        title,
        description,
        type,
        category,
        createdDate,
        userId: user._id,
        price,
        model,
        exampleInput,
        exampleOutput,
        username,
      });

      // Check if a file was uploaded
      if (promptFile) {
        console.log('File received:', promptFile);
        newPrompt.prompt = {
          data: promptFile.buffer,  // Binary data of the file
          contentType: promptFile.mimetype, // File type (MIME type)
        };
      } else if (exampleOutput) {
        // If no file, use the exampleOutput as the prompt data in text form
        console.log('Using exampleOutput as prompt data');
        newPrompt.prompt = {
          data: Buffer.from(exampleOutput, 'utf-8'),  // Convert exampleOutput text to buffer
          contentType: 'text/plain',  // Set content type for plain text
        };
      } else {
        console.log('No file or exampleOutput provided');
        return res.status(400).json({ message: "Prompt data is required" });
      }

      await newPrompt.save();
      console.log('Prompt saved successfully');
      return res.status(200).json({ message: "Successful" });
    } else {
      console.log('User not found');
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error('Error in Create endpoint:', err); // Log the entire error object
    return res.status(500).json({ message: "Not successful", error: err.message });
  }
};


export const Show = async (req, res) => {
  PromptModel.find({ status: 'approved' })
  .then(prompts => res.status(200).json(prompts))
  .catch(err => res.status(400).send(err));
};
export const GetPrompt=async (req, res) => {
  try {
    const prompts = await PromptModel.find();
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const OtherPrompts=async (req, res) => {
    const { username } = req.params;
  
    try {
      // Fetch prompts by username
      const prompts = await PromptModel.find({ username });
  
      if (!prompts) {
        return res.status(404).json({ message: 'No prompts found for this user' });
      }
  
      res.status(200).json(prompts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
export const PromptDetail=async (req, res) => {
    const { promptId } = req.params;
    
    try {
      // Fetch prompt by promptId
      const prompt = await PromptModel.findById(promptId) // Assuming 'userId' is the reference to the User model
  
      if (!prompt) {
        return res.status(404).json({ message: 'Prompt not found' });
      }
  
      res.status(200).json({ ...prompt.toObject()});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
export const DeletePrompt=async (req, res) => {
  try {
    const { promptId } = req.params;
    const prompt = await PromptModel.findById(promptId);
    if (!prompt) {
      return res.status(404).send('Prompt not found');
    }
    prompt.deleted = true;  // Mark as deleted
    await prompt.save();
    res.send('Prompt moved to trash');
  } catch (error) {
    res.status(500).send('Error deleting prompt: ' + error.message);
  }
}
export const RestorePrompt=async (req, res) => {
  try {
    const { promptId } = req.params;
    const prompt = await PromptModel.findById(promptId);
    if (!prompt) {
      return res.status(404).send('Prompt not found');
    }
    prompt.deleted = false;  // Restore prompt
    await prompt.save();
    res.send('Prompt restored from trash');
  } catch (error) {
    res.status(500).send('Error restoring prompt: ' + error.message);
  }
}
export const PermanentlyDelete=async (req, res) => {
  try {
    const { promptId } = req.params;
    await PromptModel.findByIdAndDelete(promptId);
    res.send('Prompt permanently deleted');
  } catch (error) {
    res.status(500).send('Error permanently deleting prompt: ' + error.message);
  }
}

export const GetPromptFile=async (req, res) => {
  const { promptId } = req.params;

  try {
    const prompt = await PromptModel.findById(promptId);
    if (!prompt) return res.status(404).send('Prompt not found');

    const { data, contentType } = prompt.prompt;

    if (!contentType) {
      return res.status(500).send('Content-Type is missing in the prompt data');
    }

    res.setHeader('Content-Disposition', `attachment; filename=prompt_${promptId}.${contentType.split('/')[1]}`);
    res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (err) {
    console.error('Failed to retrieve prompt file', err);
    res.status(500).send('Failed to retrieve prompt file');
  }
}