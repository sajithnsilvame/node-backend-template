import Joi from "joi";

export const UserRegisterSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required.',
    }),
    lastName: Joi.string().optional().messages({
        'string.base': 'Last name must be a string.',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format.',
        'string.empty': 'Email is required.',
    }),
    username: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Username is required.',
        'string.min': 'Username must be at least 3 characters long.',
        'string.max': 'Username cannot exceed 50 characters.',
    }),
    password: Joi.string().min(8).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.',
    }),
    mobile: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/) 
        .optional()
        .messages({
            'string.length': 'Mobile number must be exactly 10 digits.',
            'string.pattern.base': 'Mobile number must contain only digits.',
        }),
});
