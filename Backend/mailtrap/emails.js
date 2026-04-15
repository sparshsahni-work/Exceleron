// emails.js - COMPLETE FILE - Replace everything in your file with this
import { sendEmail } from "./brevo.config.js";
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE
} from "./emailTemplates.js";




import { WELCOME_WITH_VERIFICATION_TEMPLATE } from "./emailTemplates.js";

export const sendWelcomeWithVerificationEmail = async (email, name, verificationCode) => {
    try {
        console.log('🔄 Sending combined Welcome + Verification email...');
        const subject = "Welcome to Exceleron! Verify Your Email";
        const htmlContent = WELCOME_WITH_VERIFICATION_TEMPLATE
            .replace("{name}", name)
            .replace("{company_name}", "Exceleron")
            .replace("{verificationCode}", verificationCode);

        await sendEmail(email, subject, htmlContent);
        console.log("✅ Welcome + Verification email sent to:", email);
    } catch (error) {
        console.error("❌ Error sending combined email:", error.message);
        throw new Error(`Error sending welcome+verification email: ${error.message}`);
    }
};












export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        console.log('🔄 Starting verification email process...');
        console.log('📧 Recipient:', email);
        console.log('🔢 Verification token:', verificationToken);
        
        const subject = "Verify Your Email Address";
        const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
        
        console.log('📝 Email subject:', subject);
        console.log('📄 HTML content prepared, length:', htmlContent.length);
        
        await sendEmail(email, subject, htmlContent);
        console.log("✅ Verification email sent successfully to:", email);
        
    } catch (error) {
        console.error("❌ Error in sendVerificationEmail:", {
            recipient: email,
            token: verificationToken,
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Error sending verification email: ${error.message}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        console.log('🔄 Starting welcome email process...');
        console.log('📧 Recipient:', email);
        console.log('👤 Name:', name);
        
        const subject = "Welcome to Exceleron!";
        const htmlContent = WELCOME_EMAIL_TEMPLATE
            .replace("{name}", name)
            .replace("{company_name}", "Exceleron")
            .replace("{company_url}", process.env.CLIENT_URL || "http://localhost:5173");
        
        console.log('📝 Email subject:', subject);
        console.log('📄 HTML content prepared, length:', htmlContent.length);
        
        await sendEmail(email, subject, htmlContent);
        console.log("✅ Welcome email sent successfully to:", email);
        
    } catch (error) {
        console.error("❌ Error in sendWelcomeEmail:", {
            recipient: email,
            name: name,
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Error sending welcome email: ${error.message}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        console.log('🔄 Starting password reset email process...');
        console.log('📧 Recipient:', email);
        console.log('🔗 Reset URL:', resetURL);
        
        const subject = "Reset Your Password";
        const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
        
        console.log('📝 Email subject:', subject);
        console.log('📄 HTML content prepared, length:', htmlContent.length);
        
        await sendEmail(email, subject, htmlContent);
        console.log("✅ Password reset email sent successfully to:", email);
        
    } catch (error) {
        console.error("❌ Error in sendPasswordResetEmail:", {
            recipient: email,
            resetURL: resetURL,
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Error sending password reset email: ${error.message}`);
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        console.log('🔄 Starting password reset success email process...');
        console.log('📧 Recipient:', email);
        
        const subject = "Password Reset Successful";
        const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE;
        
        console.log('📝 Email subject:', subject);
        console.log('📄 HTML content prepared, length:', htmlContent.length);
        
        await sendEmail(email, subject, htmlContent);
        console.log("✅ Password reset success email sent successfully to:", email);
        
    } catch (error) {
        console.error("❌ Error in sendResetSuccessEmail:", {
            recipient: email,
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Error sending password reset success email: ${error.message}`);
    }
};












// New Feature: Email to notify admin of a new permission request
export const sendAdminPermissionRequestEmail = async (adminEmail, requesterName, requesterEmail, reason) => {
    try {
        const subject = "New Admin Permission Request on Exceleron";
        const htmlContent = `
            <p>Hello Admin,</p>
            <p>A new request for admin permissions has been submitted.</p>
            <ul>
                <li><strong>User:</strong> ${requesterName}</li>
                <li><strong>Email:</strong> ${requesterEmail}</li>
                <li><strong>Reason:</strong> ${reason}</li>
            </ul>
            <p>Please log in to the Admin Panel to approve or deny this request.</p>
        `;
        await sendEmail(adminEmail, subject, htmlContent);
    } catch (error) {
        console.error("Error sending admin permission request email:", error);
    }
};