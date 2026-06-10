const express = require('express');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));

// Initialize clients
const client = new Anthropic();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Business context for Green Leaf
const BUSINESS_CONTEXT = `You are a professional AI receptionist for Green Leaf, a cleaning and construction company.

Business Details:
- Business Name: Green Leaf
- Hours: Monday-Friday 9AM-5PM, Saturday 10AM-3PM (Closed Sunday)
- Services: Cleaning Services, Construction Services
- Email: blessigwe0313@gmail.com

Your responsibilities:
1. Greet callers professionally and warmly
2. Understand what service they need (cleaning or construction)
3. Collect essential information: Name, Phone Number, Email, Service Type, Preferred Date/Time
4. Answer common questions about services and hours
5. Be helpful, friendly, and professional
6. Confirm all details before ending the call

Common Q&A:
- "Do you offer emergency services?" - "Yes, we can discuss emergency requests. What's your situation?"
- "What areas do you service?" - "We service the local area. Can you tell me your location?"
- "How much do you charge?" - "Pricing varies by project scope. Can you describe what you need?"
- "How long does a project take?" - "It depends on the scope. For cleaning, typically a few hours. For construction, we'll need to discuss details."

Always:
- Keep responses concise (1-2 sentences per response)
- Ask clarifying questions
- Be empathetic and professional
- Never make promises about pricing without a consultation
- Offer to have someone call them back if you can't answer`;

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store conversation state (in production, use database)
const callSessions = new Map();

// Main webhook for incoming calls
app.post('/voice', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Start the call
  const gather = twiml.gather({
    numDigits: 1,
    action: '/gather-input',
    method: 'POST',
    input: 'speech',
    speechTimeout: 3,
    maxSpeechTime: 60,
    enhanced: true,
  });

  // AI greeting
  gather.say(
    {
      voice: 'alice',
      rate: '95%',
    },
    'Hello! Thank you for calling Green Leaf. I\'m your AI receptionist. How can I help you today? Are you calling about cleaning services or construction services?'
  );

  res.type('text/xml').send(twiml.toString());
});

// Handle voice input and AI conversation
app.post('/gather-input', async (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  
  // Initialize or get call session
  if (!callSessions.has(callSid)) {
    callSessions.set(callSid, {
      conversation: [],
      leadData: {},
      stage: 'greeting',
    });
  }
  
  const session = callSessions.get(callSid);
  
  try {
    // Add user input to conversation
    session.conversation.push({
      role: 'user',
      content: speechResult,
    });

    // Get AI response using Claude
    const systemPrompt = BUSINESS_CONTEXT;
    
    const response = await client.messages.create({
      model: 'claude-opus-4-20250805',
      max_tokens: 150,
      system: systemPrompt,
      messages: session.conversation,
    });

    const aiMessage = response.content[0].text;

    // Add AI response to conversation
    session.conversation.push({
      role: 'assistant',
      content: aiMessage,
    });

    // Extract any lead data from conversation
    extractLeadData(session, speechResult);

    // Check if call should end
    const shouldEnd = aiMessage.toLowerCase().includes('call back') || 
                     aiMessage.toLowerCase().includes('goodbye') ||
                     session.conversation.length > 20;

    // Build response
    const twiml = new twilio.twiml.VoiceResponse();

    if (shouldEnd && Object.keys(session.leadData).length > 0) {
      // Send lead email
      await sendLeadEmail(session.leadData);
      
      twiml.say(
        { voice: 'alice' },
