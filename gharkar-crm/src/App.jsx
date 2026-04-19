import { useState, useEffect, useCallback, useRef } from "react";

const T = {
  navy: "#0B1437", navyMid: "#112057", navyLight: "#1A2F6E",
  gold: "#D4A853", goldLight: "#F0C97A", goldDim: "#A07830",
  cream: "#F7F3EC", creamDark: "#EDE6D8",
  green: "#1A7A4A", greenBg: "#E8F5EE",
  red: "#C0392B", redBg: "#FDECEA",
  blue: "#1A5FA8", blueBg: "#E8F0FB",
  amber: "#B8730A", amberBg: "#FEF3E2",
  purple: "#6A1B9A", purpleBg: "#F3E5F5",
  text: "#1A1A2E", textMid: "#4A4A6A", textLight: "#8888AA",
  white: "#FFFFFF", border: "#E2DDD5",
};

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:${T.cream};color:${T.text}}
input,select,textarea{font-family:'DM Sans',sans-serif;font-size:14px;background:${T.white};border:1px solid ${T.border};border-radius:8px;padding:9px 13px;width:100%;outline:none;color:${T.text};transition:border 0.2s}
input:focus,select:focus,textarea:focus{border-color:${T.gold}}
button{font-family:'DM Sans',sans-serif;cursor:pointer}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
.fade{animation:fadeIn 0.22s ease}
.slide{animation:slideDown 0.2s ease}
.pulse{animation:pulse 2s infinite}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
`;

const STEPS = [
  { id: 1, cat: "lead", label: "Lead Generation", desc: "Identify and source potential home loan clients from referrals, online portals, builders, DSAs, and walk-ins.", actions: ["Record lead source (referral / portal / builder / walk-in / DSA)", "Note referral person name if applicable", "Log initial details immediately", "Assign to team member"], portalCheck: false },
  { id: 2, cat: "lead", label: "Lead Capturing – MIS Data Entry", desc: "Enter all lead details into MIS immediately after first contact. Do not delay MIS entry.", actions: ["Enter full name, phone, email in MIS", "Enter loan type and approximate amount", "Enter property city and type", "Mark lead source in MIS", "Set initial pipeline status in MIS"], portalCheck: false },
  { id: 3, cat: "lead", label: "Send Message – Call Response", desc: "Send the appropriate WhatsApp/SMS template based on whether the client's call was received or not.", actions: ["If call received: send welcome message + document list link", "If call not received: send missed call follow-up message", "Log message sent time and type in MIS", "Set follow-up reminder"], portalCheck: false },
  { id: 4, cat: "lead", label: "Understand Client Requirement – FIR Questionnaire", desc: "Conduct FIR (Fact-finding, Intent, Requirement) questionnaire call with client. Log all answers in MIS remarks.", actions: ["Ask: Purpose of loan (purchase / BT / top-up / construction)", "Ask: Property type and location", "Ask: Employment type (salaried / self-employed / business)", "Ask: Monthly income and existing EMIs", "Ask: Co-applicant details (name, income, relationship)", "Ask: Desired timeline for disbursement", "Log all FIR answers as remarks in MIS"], portalCheck: false },
  { id: 5, cat: "analysis", label: "Analyse Loan Eligibility", desc: "Use EMI / GST / Banking Calculator to determine exact loan eligibility for the client.", actions: ["Calculate max EMI client can service (income × 50% FOIR)", "Deduct existing EMI obligations", "Arrive at eligible loan amount", "Note FOIR % and if it is within bank norms", "Note applicable ROI range from shortlisted banks", "Shortlist 2–3 suitable banks based on profile"], portalCheck: false },
  { id: 6, cat: "analysis", label: "Update Primary Remarks in MIS", desc: "Update MIS with eligibility result, shortlisted banks, and next planned action.", actions: ["Update eligible loan amount in MIS", "Update shortlisted bank(s) in MIS", "Update remarks with key points from eligibility analysis", "Set next follow-up date in MIS"], portalCheck: false },
  { id: 7, cat: "documents", label: "Share Document List to Customer", desc: "Send the relevant document checklist to the client via WhatsApp based on their employment type.", actions: ["Select correct document template (salaried / self-employed / business)", "Send document list message via WhatsApp", "Confirm client has received the message", "Log document list sent date in MIS"], docStage: "round1", portalCheck: false },
  { id: 8, cat: "documents", label: "Share Details Sheet with Remarks", desc: "Send the detailed sheet explaining why each document is required — reduces client confusion.", actions: ["Send document details sheet to client", "Explain each document's purpose briefly on call", "Answer client queries on documents", "Update MIS that details sheet was shared"], docStage: "round1", portalCheck: false },
  { id: 9, cat: "documents", label: "Create Client Folder Structure", desc: "Create the standard folder structure for the client on the shared drive immediately.", actions: ["Create root folder: [ClientName_LoanType_Date]", "Create KYC > Applicant / Co-applicant / Company", "Create Income > Applicant / Co-applicant / Company", "Create Banking > Applicant / Co-applicant / Company", "Create Obligations > Applicant / Co-applicant / Company", "Create Property Documents > Seller / Builder", "Create Disbursement Documents > Formats / Bank Acceptance Letter"], docStage: "round1", portalCheck: false },
  { id: 10, cat: "documents", label: "Collect Documents from Client", desc: "Receive all documents from client via WhatsApp, email, or in person.", actions: ["Acknowledge each document received", "Create pending document checklist", "Follow up same day if critical documents missing", "Do not proceed to Step 11 until minimum required docs received"], docStage: "round1", portalCheck: false },
  { id: 11, cat: "documents", label: "Save / Rename / Merge / Split Documents", desc: "Organise all received documents into the correct folders with proper naming convention.", actions: ["Rename files: [DocType_ApplicantName_Date]", "Place each file in correct sub-folder", "Merge multi-page scans where needed", "Split combined PDFs into separate documents", "Compress large files where needed"], docStage: "round1", portalCheck: false },
  { id: 12, cat: "documents", label: "Check Documents in 30 Minutes", desc: "Review all received documents for completeness, clarity, and validity within 30 minutes of saving.", actions: ["Check all pages are clear and readable", "Check document dates are not expired", "Check names match across all documents", "Check income figures are consistent", "Note all discrepancies found"], docStage: "round1", portalCheck: false },
  { id: 13, cat: "documents", label: "Create Query File", desc: "Create a Word document listing all queries found during document check. Include date in filename.", actions: ["Create file named: Queries_[ClientName]_[DD-MM-YYYY]", "List each query clearly with serial number", "Specify which document has the issue and what is needed", "Save query file to client folder"], docStage: "round1", portalCheck: false },
  { id: 14, cat: "documents", label: "Send Queries to Client", desc: "Send the query document to the client with a brief explanation of each query.", actions: ["Send query file via WhatsApp and email", "Explain each query briefly on call", "Set clear deadline for client to resolve queries", "Log query sent date in MIS"], docStage: "round1", portalCheck: false },
  { id: 15, cat: "documents", label: "Collect Pending / Query Documents", desc: "Follow up and collect all query-resolved documents from client.", actions: ["Follow up every 2 days if documents are pending", "Collect each resolved document", "Re-check resolved documents for correctness", "Update pending query list after each collection", "Update MIS status"], docStage: "round1", portalCheck: false },
  { id: 16, cat: "analysis", label: "Prepare OCR Calculation Sheet", desc: "Prepare the OCR (Obligation Coverage Ratio) Calculation Sheet and save to client folder.", actions: ["Enter all income figures (all applicants)", "Enter all existing obligations and EMIs", "Calculate net income post all obligations", "Verify FOIR is within acceptable range", "Save file as: OCR_[ClientName]_[Date]", "Save to client folder"], portalCheck: false },
  { id: 17, cat: "login", label: "Initiate Login", desc: "Submit the loan application through Email / App / Software / Website as per bank process.", actions: ["Choose submission method (email / app / portal / website)", "Fill bank application form accurately and completely", "Attach all documents as per bank checklist", "Submit application", "Collect application reference number", "Update MIS with login date and reference number"], portalCheck: true },
  { id: 18, cat: "login", label: "Resolve Bank Login Queries", desc: "Address all queries raised by the bank's credit or underwriting team promptly.", actions: ["Note each bank query when received", "Collect required clarification or documents from client", "Respond to bank within 24 hours", "Log each query and its resolution date in MIS"], portalCheck: true },
  { id: 19, cat: "property", label: "Send Property Document List to Client", desc: "Share the list of property documents required as per discussion with the bank.", actions: ["Send property document checklist to client", "Explain legal and technical valuation requirements", "Confirm client has documents ready or has access to them", "Set deadline for collection"], docStage: "round2", portalCheck: false },
  { id: 20, cat: "property", label: "Collect Property Documents", desc: "Receive all property-related documents from client, builder, or seller.", actions: ["Collect from client or directly from builder/seller", "Acknowledge each document received", "Create property document receipt checklist", "Note missing documents immediately"], docStage: "round2", portalCheck: false },
  { id: 21, cat: "property", label: "Save to Property Documents Folder", desc: "Organise all property documents into the correct folder with proper naming.", actions: ["Rename each property file properly", "Place in Property Documents > Seller or Builder subfolder", "Ensure complete set is available before proceeding"], docStage: "round2", portalCheck: false },
  { id: 22, cat: "property", label: "Read All Property Document Pages", desc: "Thoroughly read every page of all property documents before submission. Flag any issues.", actions: ["Read sale agreement / allotment letter completely", "Check ownership chain is clear and unbroken", "Check if any dues or disputes mentioned in any document", "Note any conditions, restrictions, or red flags", "Flag to Gaurav Sir immediately if any concern found"], docStage: "round2", portalCheck: false },
  { id: 23, cat: "property", label: "Initiate Legal & Valuation (Do Not Wait)", desc: "Login for Legal and Valuation simultaneously. Do not wait for sanction letter. Initiate within 3 days of file login.", actions: ["Submit property documents for legal report", "Submit property details for valuation simultaneously", "Log legal initiation date in MIS", "Log valuation initiation date in MIS", "Set 7-day follow-up for both reports in MIS"], portalCheck: true, advocateCheck: true, valuationCheck: true },
  { id: 24, cat: "property", label: "Update MIS – Legal & Valuation Status", desc: "Update MIS with initiation dates and current status of legal and valuation reports.", actions: ["Update legal initiation date in MIS", "Update valuation initiation date in MIS", "Update current status of both", "Set next follow-up date in MIS"], portalCheck: true },
  { id: 25, cat: "property", label: "Resolve Legal & Valuation Queries", desc: "Address any queries raised during the legal or valuation process.", actions: ["Note each query from legal or valuation team", "Collect required documents or clarifications from client/seller", "Respond to lawyer or valuation team promptly", "Log all query resolutions in MIS"], advocateCheck: true, valuationCheck: true, portalCheck: false },
  { id: 26, cat: "sanction", label: "Ask Banker for Reports & Sanction Letter", desc: "Follow up with bank RM for Legal Report, Valuation Report, and Sanction Letter.", actions: ["Call bank RM every 2 days for update", "Request all 3 documents together where possible", "Log each follow-up call date in MIS", "Escalate to Gaurav Sir if delayed beyond 15 working days"], portalCheck: true },
  { id: 27, cat: "sanction", label: "Check Sanction Terms & Conditions", desc: "Review the sanction letter carefully before sharing with client. Do not share without reviewing.", actions: ["Check sanctioned amount vs requested amount", "Check interest rate and type (fixed or floating)", "Check processing fee and all other charges", "Check any special conditions or requirements", "Note all discrepancies or concerns"], portalCheck: true },
  { id: 28, cat: "sanction", label: "Update MIS – Sanction Terms", desc: "Update MIS with all sanction terms and conditions immediately after review.", actions: ["Update sanctioned amount in MIS", "Update ROI in MIS", "Update EMI in MIS", "Update tenure in MIS", "Update all charges in MIS", "Update any special conditions in MIS"], portalCheck: false },
  { id: 29, cat: "sanction", label: "Check LTV & FOIR", desc: "Verify that Loan-to-Value (LTV) and Fixed Obligation to Income Ratio (FOIR) are within acceptable bank limits.", actions: ["Calculate LTV: Loan Amount ÷ Property Value × 100", "Verify LTV is within bank norms (typically max 80–90%)", "Calculate FOIR: (All EMIs including new EMI) ÷ Gross Income × 100", "Verify FOIR is within bank norms (typically max 50–55%)", "Note if either is out of range"], portalCheck: false },
  { id: 30, cat: "sanction", label: "Discuss with Gaurav Sir – LTV / FOIR Query", desc: "If LTV or FOIR is not within acceptable range, escalate to Gaurav Sir immediately before proceeding.", actions: ["Prepare summary of the LTV or FOIR issue", "Show calculation sheet to Gaurav Sir", "Discuss resolution options together", "Document the decision taken", "Proceed strictly as per Gaurav Sir's guidance"], portalCheck: false },
  { id: 31, cat: "disbursement", label: "Send Charges List to Customer", desc: "Send complete charges breakup to client using MIS PF Calculation table.", actions: ["Generate charges from MIS PF Calculation table", "Include: processing fee, legal fee, valuation fee, stamp duty, registration charges", "Send charges list to client via WhatsApp", "Explain each charge briefly", "Get client's written confirmation of charges understood"], docStage: "round3", portalCheck: false },
  { id: 32, cat: "disbursement", label: "Send Disbursement Documents List", desc: "Send the list of disbursement documents required from client using the standard message template.", actions: ["Send disbursement document list (standard template)", "Explain which documents need to be original", "Mention which bank formats need to be signed", "Set clear deadline for document collection", "Log sent date in MIS"], docStage: "round3", portalCheck: false },
  { id: 33, cat: "disbursement", label: "Collect All Disbursement Papers", desc: "Collect all disbursement documents from client. Do not fix disbursement appointment until all docs are in hand.", actions: ["Collect all original documents", "Check each document against disbursement checklist", "Note any missing documents immediately", "Do not proceed to disbursement appointment if any critical document is missing"], docStage: "round3", portalCheck: false },
  { id: 34, cat: "disbursement", label: "Save to Disbursement Folder", desc: "Organise all disbursement documents into the disbursement folder with proper naming.", actions: ["Rename each disbursement document properly", "Place in Disbursement Documents folder", "Separate Formats from Bank Acceptance Letters", "Create final checklist of all documents saved in folder"], docStage: "round3", portalCheck: false },
  { id: 35, cat: "disbursement", label: "Follow Up for Disbursement with Banker", desc: "Coordinate with bank RM to confirm all disbursement documents are in order and schedule disbursement.", actions: ["Confirm all documents are in order with bank RM", "Confirm disbursement amount and date with bank", "Confirm mode of disbursement (RTGS / NEFT / cheque)", "Update MIS with confirmed disbursement date"], portalCheck: true },
  { id: 36, cat: "disbursement", label: "Disbursement Appointment & Disbursement", desc: "Fix the disbursement appointment at the bank and ensure client, seller/builder, and all parties are present.", actions: ["Book disbursement appointment at branch", "Inform client of date, time, branch address, and documents to carry", "Inform seller or builder of disbursement schedule", "Confirm with bank RM one day before", "Attend disbursement with client"], portalCheck: false },
  { id: 37, cat: "disbursement", label: "Update MIS – Final File Status", desc: "Update MIS with final disbursement status immediately after disbursement is complete.", actions: ["Mark file status as Disbursed in MIS", "Update disbursement amount in MIS", "Update disbursement date in MIS", "Update mode of payment in MIS", "Update any balance pending (in case of part disbursement)"], portalCheck: false },
  { id: 38, cat: "closing", label: "Ask for Google Review & Video Testimonial", desc: "Request a Google review and video testimonial from the client immediately after disbursement.", actions: ["Send Google review link to client via WhatsApp immediately after disbursement", "Request a short video testimonial (30–60 seconds)", "Thank client personally for their trust", "Ask for referrals from their network", "Log Google review received in MIS"], portalCheck: false },
  { id: 39, cat: "closing", label: "Completed", desc: "This lead process is 100% complete.", actions: [], portalCheck: false }
];

const CAT_META = {
  lead: { label: "Lead & Enquiry", color: T.navy, bg: "#EEF0FB", border: "#C5CAE9" },
  analysis: { label: "Analysis", color: "#7B3F00", bg: "#FFF3E0", border: "#FFCC80" },
  documents: { label: "Documents", color: T.blue, bg: T.blueBg, border: "#90CAF9" },
  login: { label: "Login", color: T.green, bg: T.greenBg, border: "#A5D6A7" },
  property: { label: "Property", color: T.purple, bg: T.purpleBg, border: "#CE93D8" },
  sanction: { label: "Sanction", color: T.amber, bg: T.amberBg, border: "#FFD54F" },
  disbursement: { label: "Disbursement", color: T.red, bg: T.redBg, border: "#EF9A9A" },
  closing: { label: "Closing", color: T.green, bg: T.greenBg, border: "#A5D6A7" },
};

const DOC_STAGE_LABELS = { round1: "Round 1 – Loan Approval Docs", round2: "Round 2 – Property Evaluation Docs", round3: "Round 3 – Disbursement Docs" };
const LEAD_STEP_IDS = STEPS.filter(s => s.cat === "lead").map(s => s.id);
const LEAD_SOURCES = ["Existing Customer", "Channel Partner", "Developer/Builder", "Referral", "Online Portal", "Walk-In", "DSA", "Social Media", "Other"];

const DOC_REQUIREMENTS = {
  "Salaried": {
    "KYC": ["Aadhaar Card (Front & Back)", "PAN Card", "Passport photos x2", "Address proof (if diff from Aadhaar)"],
    "Income": ["3 months salary slips", "Form 16 (last 2 years)", "6 months bank statements (salary a/c)", "Offer / Appointment letter", "IT Returns last 2 years"],
    "Obligations": ["All existing loan statements", "Credit card statements (if any)"],
    "Property": ["Sale Agreement / Allotment Letter", "Title Deed / Index II", "Encumbrance Certificate (13/30 yrs)", "Building & Layout Plan", "Property tax receipts", "NOC from builder/society", "Chain of title documents"],
    "Disbursement": ["Demand letter from builder", "Own contribution receipts", "Bank signed formats", "NACH mandate", "Stamp duty / Registration challan"],
  },
  "Self-Employed": {
    "KYC": ["Aadhaar Card (Front & Back)", "PAN Card", "Passport photos x2", "Business address proof"],
    "Income": ["IT Returns last 3 years (personal)", "P&L Statement last 3 years", "Balance Sheet last 3 years", "12 months personal bank statements", "12 months business bank statements", "GST Certificate", "Business continuity proof"],
    "Obligations": ["All existing loan statements", "OD / CC account statements"],
    "Property": ["Sale Agreement / Allotment Letter", "Title Deed / Index II", "Encumbrance Certificate (13/30 yrs)", "Building & Layout Plan", "Property tax receipts", "NOC from builder/society", "Chain of title documents"],
    "Disbursement": ["Demand letter from builder", "Own contribution receipts", "Bank signed formats", "NACH mandate", "Stamp duty / Registration challan"],
  },
  "Pvt Ltd Company": {
    "Director KYC": ["Aadhaar of all directors", "PAN of all directors", "Company PAN", "Directors address proofs", "Passport photos of directors"],
    "Company Docs": ["Certificate of Incorporation (COI)", "Memorandum of Association (MOA)", "Articles of Association (AOA)", "Board Resolution for loan", "Shareholding pattern", "Latest MCA/ROC filings"],
    "Income": ["Company ITR last 3 years", "Company P&L last 3 years", "Company Balance Sheet last 3 years", "12 months company bank statements", "Directors personal ITR last 2 years", "Directors bank statements 6 months", "GST Certificate & Returns"],
    "Obligations": ["Company loan statements", "OD/CC statements", "Directors personal loan statements"],
    "Property": ["Sale Agreement / Allotment Letter", "Title Deed / Index II", "Encumbrance Certificate", "Building & Layout Plan", "Property tax receipts", "NOC from builder/society"],
    "Disbursement": ["Demand letter", "Own contribution receipts", "Board resolution for disbursement", "Bank signed formats", "NACH mandate", "Stamp duty / Registration challan"],
  },
  "Partnership Firm": {
    "Partner KYC": ["Aadhaar of all partners", "PAN of all partners", "Firm PAN", "Partners address proofs", "Passport photos of all partners"],
    "Firm Docs": ["Partnership Deed (registered)", "Firm registration certificate", "Authority letter from all partners"],
    "Income": ["Firm ITR last 3 years", "Firm P&L last 3 years", "Firm Balance Sheet last 3 years", "12 months firm bank statements", "Partners capital account statements 3 years", "Partners personal ITR last 2 years", "GST Certificate (if applicable)"],
    "Obligations": ["Firm loan statements", "OD/CC statements", "Partners personal loan statements"],
    "Property": ["Sale Agreement / Allotment Letter", "Title Deed / Index II", "Encumbrance Certificate", "Building & Layout Plan", "Property tax receipts", "NOC from builder/society"],
    "Disbursement": ["Demand letter", "Own contribution receipts", "Authority letter by all partners", "Bank signed formats", "NACH mandate", "Stamp duty / Registration challan"],
  },
  "NRI": {
    "KYC": ["Passport (all pages)", "OCI / PIO Card", "Valid Visa copy", "PAN Card", "Aadhaar (if available)", "India address proof", "Overseas address proof", "Passport photos x2"],
    "Income": ["Overseas employment contract", "3 months overseas salary slips", "6 months NRE/NRO bank statements", "6 months overseas bank statements", "IT Returns 2 years (India, if filed)", "Work permit / Labour card", "Latest employer salary certificate"],
    "Obligations": ["India loan statements (if any)", "Overseas loan statements (if any)"],
    "Property": ["Sale Agreement / Allotment Letter", "Title Deed / Index II", "Encumbrance Certificate", "Building & Layout Plan", "Property tax receipts", "NOC from builder/society"],
    "Disbursement": ["Demand letter", "Own contribution receipts", "Power of Attorney (notarised)", "Bank signed formats", "NACH mandate", "FEMA declaration", "Stamp duty / Registration challan"],
  },
};

const WA_TEMPLATES = [
  { id:"welcome",  icon:"👋", label:"Welcome",       msg: l => `Dear ${l.name},\n\nThank you for reaching out to GharKar for your ${l.loanType||"home loan"} requirement.\n\nOur team will connect with you shortly to understand your requirements and guide you through the entire loan process.\n\nBest regards,\nGharKar Home Loans Team` },
  { id:"doclist",  icon:"📋", label:"Doc List",      msg: l => `Dear ${l.name},\n\nKindly arrange the following documents for your ${l.loanType||"home loan"} application:\n\n📁 *KYC:* Aadhaar (front & back), PAN Card, Passport photos x2\n💰 *Income:* ${l.employmentType==="Salaried"?"3 months salary slips, Form 16, 6 months bank statements":"ITR last 3 years, P&L + Balance Sheet, 12 months bank statements"}\n\nPlease share at the earliest for faster processing.\n\nGharKar Home Loans Team` },
  { id:"missed",   icon:"📞", label:"Missed Call",   msg: l => `Dear ${l.name},\n\nWe tried reaching you regarding your home loan enquiry but couldn't connect.\n\nPlease call us back at your convenience, or let us know a good time to reach you.\n\nGharKar Home Loans Team` },
  { id:"sanction", icon:"🎉", label:"Sanction!",     msg: l => `Dear ${l.name},\n\n*Congratulations!* 🎉\n\nYour home loan application has been *sanctioned* by the bank.\n\nWe will now initiate the disbursement process. Our team will contact you shortly with the next steps.\n\nThank you for choosing GharKar!\nGharKar Home Loans Team` },
  { id:"disb",     icon:"🏦", label:"Disbursement",  msg: l => `Dear ${l.name},\n\nThis is a reminder for your home loan *disbursement appointment*.\n\nPlease carry all original documents as discussed. Contact us immediately for any queries.\n\nGharKar Home Loans Team` },
  { id:"review",   icon:"⭐", label:"Review Request",msg: l => `Dear ${l.name},\n\nCongratulations on your successful home loan disbursement! 🏠\n\nIt was our pleasure to serve you. We would be grateful if you could spare 2 minutes to leave us a *Google Review* — it helps us serve more families like yours.\n\nThank you!\nGharKar Home Loans Team` },
  { id:"reengage", icon:"🔄", label:"Re-engage",     msg: l => `Dear ${l.name},\n\nHope you are doing well!\n\nWe noticed we haven't been in touch recently regarding your home loan requirement. Interest rates are competitive right now — this could be a great time to proceed.\n\nWould you like us to revisit your case? We are ready to assist.\n\nGharKar Home Loans Team` },
  { id:"docremind",icon:"📂", label:"Doc Reminder",  msg: l => `Dear ${l.name},\n\nGentle reminder — we are waiting for the remaining documents to process your home loan application further.\n\nKindly share the pending documents at the earliest to avoid delays.\n\nGharKar Home Loans Team` },
];

const SK = "hlcrm_v7";
function init() {
  return {
    users: [{ id: "admin", name: "Gaurav Sir", role: "admin", username: "admin", password: "admin123", active: true, createdAt: td() }],
    leads: [], dailyLogs: {},
    escalations: [],
    portalCheckLog: {},
    externalFollowups: [],
    commLogs: {},
    notifications: [],
  };
}
function td() { return new Date().toISOString().slice(0, 10); }
function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function tsNow() { return new Date().toISOString(); }

const API_BASE = 'https://gharkar-crm.onrender.com/api';
const GEMINI_KEY = "AIzaSyC93b-mQ3Q8VC3V3kvfFtOngns3AH2Y2gc";

async function analyseDocumentsAI(employmentType, currentStep, receivedText, loanDetails) {
  const docSet = DOC_REQUIREMENTS[employmentType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.entries(docSet).flatMap(([cat, docs]) => docs.map(d => `[${cat}] ${d}`));
  const prompt = `You are an expert home loan processor in India. Analyse the documents received and identify what is present, missing, and any concerns.\nBORROWER: ${loanDetails.name || "Client"}, Employment: ${employmentType}, Loan: ${loanDetails.loanType || "Home Loan"}, Amount: Rs.${Number(loanDetails.loanAmount||0).toLocaleString("en-IN")}\nPROCESS STEP: ${currentStep}\nREQUIRED DOCUMENTS:\n${allDocs.map((d,i)=>`${i+1}. ${d}`).join("\n")}\nDOCUMENTS RECEIVED (described by loan officer):\n${receivedText}\nRespond ONLY in this exact JSON format:{"confirmed":["names of docs clearly present"],"missing":["names of docs not mentioned"],"concerns":["any red flags or issues"],"nextAction":"specific next step the officer should take now","score":0}`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.1,maxOutputTokens:1024}})
    });
    if(!res.ok) throw new Error("API error");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text||"";
    const match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("No JSON");
    return {source:"gemini",...JSON.parse(match[0])};
  } catch(e) {
    console.warn("Gemini fallback:",e.message);
    return ruleBasedDocAnalysis(employmentType,receivedText);
  }
}

function ruleBasedDocAnalysis(employmentType, receivedText) {
  const docSet = DOC_REQUIREMENTS[employmentType]||DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.values(docSet).flat();
  const txt = receivedText.toLowerCase();
  const KW = {
    "aadhaar":["aadhaar","aadhar","uid"],"pan":["pan card"," pan ","pan-"],
    "salary slip":["salary slip","payslip","pay slip"],"form 16":["form 16","form16"],
    "bank statement":["bank statement","bank stmt","account statement"],
    "it return":["itr","it return","income tax return"],"offer":["offer letter","appointment letter"],
    "p&l":["p&l","profit and loss","profit & loss"],"balance sheet":["balance sheet"],
    "gst":["gst certificate","gstin"],"passport":["passport"],"oci":["oci card","pio card"],
    "work permit":["work permit","labour card"],"moa":["moa","memorandum"],
    "aoa":["aoa","articles of association"],"partnership deed":["partnership deed"],
    "board resolution":["board resolution"],"encumbrance":["encumbrance","ec "],
    "noc":["noc ","no objection"],"nach":["nach","ecs mandate"],
    "demand letter":["demand letter"],"title deed":["title deed","index ii"],
    "sale agreement":["sale agreement","allotment letter"],"coi":["certificate of incorporation","coi"],
  };
  const confirmed=[],missing=[];
  allDocs.forEach(doc=>{
    const dl=doc.toLowerCase();
    let found=txt.includes(dl.slice(0,12));
    if(!found){for(const[key,pats]of Object.entries(KW)){if(dl.includes(key)&&pats.some(p=>txt.includes(p))){found=true;break;}}}
    if(found)confirmed.push(doc);else missing.push(doc);
  });
  const concerns=[];
  if(missing.length>allDocs.length*0.6)concerns.push("Over 60% of required documents not yet received — do not proceed to bank login.");
  if(!txt.includes("pan")&&!txt.includes("aadhaar")&&!txt.includes("aadhar"))concerns.push("Basic KYC (PAN + Aadhaar) not confirmed — mandatory for all cases.");
  if(txt.includes("expired")||txt.includes("expiry"))concerns.push("Document expiry mentioned — verify all validity dates.");
  const score=Math.round((confirmed.length/allDocs.length)*100);
  let nextAction="Share complete document list with client and follow up within 2 days.";
  if(score>=80)nextAction="Most documents collected. Prepare OCR sheet and initiate bank login.";
  else if(score>=50)nextAction="Send query file for pending documents. Follow up every 2 days.";
  return{source:"rule-engine",confirmed,missing,concerns,nextAction,score};
}

// ─── REMINDER ENGINE ─────────────────────────────────────────────────────────
function useReminders(session, store, persist) {
  const [popup, setPopup] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);
  const lastReminderRef = useRef(null);

  useEffect(() => {
    if (!session || session.role === "admin") return;
    // Check every minute if 3-hour reminder is due
    const checkReminder = () => {
      const now = Date.now();
      const last = lastReminderRef.current;
      const THREE_HOURS = 3 * 60 * 60 * 1000;
      const DEMO_INTERVAL = 5 * 60 * 1000; // 5 min in demo for testing
      if (!last || (now - last) >= THREE_HOURS) {
        // Portal check reminder
        const portalSteps = STEPS.filter(s => s.portalCheck);
        const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id && l.currentStep < 38);
        const needsPortalCheck = myLeads.some(l => portalSteps.find(s => s.id === l.currentStep));
        if (needsPortalCheck) {
          lastReminderRef.current = now;
          setPopup({ type: "portal", msg: "Time to check your bank portals! Log in now to check for queries, sanction letters, or disbursement updates." });
        }
      }
    };
    checkReminder();
    const iv = setInterval(checkReminder, 60 * 1000);
    return () => clearInterval(iv);
  }, [session, store.leads]);

  // 24-hour escalation check
  useEffect(() => {
    if (!session || session.role === "admin") return;
    const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id && l.currentStep < 38);
    const now = new Date();
    const escalated = [];
    myLeads.forEach(l => {
      const hist = (l.stageHistory || []);
      if (!hist.length) return;
      const last = hist[hist.length - 1];
      const movedAt = new Date(last.date);
      const diffHours = (now - movedAt) / (1000 * 60 * 60);
      if (diffHours > 24) {
        const step = STEPS.find(s => s.id === l.currentStep);
        escalated.push({ leadName: l.name, step: step?.label, hours: Math.round(diffHours) });
      }
    });
    if (escalated.length > 0) {
      // Add escalation to store for admin visibility
      const newEsc = { id: gid(), date: td(), staffId: session.id, staffName: session.name, items: escalated, seen: false };
      const existing = (store.escalations || []);
      const todayEsc = existing.find(e => e.staffId === session.id && e.date === td());
      if (!todayEsc) {
        persist({ ...store, escalations: [newEsc, ...existing.slice(0, 99)] });
        setEscalationAlert(escalated);
      }
    }
  }, [session]);

  return { popup, setPopup, escalationAlert, setEscalationAlert };
}

// ─── POPUP REMINDER COMPONENT ─────────────────────────────────────────────────
function ReminderPopup({ popup, onDismiss }) {
  if (!popup) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,20,55,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: T.white, borderRadius: 18, padding: "28px 28px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="slide">
        <div style={{ fontSize: 28, marginBottom: 12, textAlign: "center" }}>{popup.type === "portal" ? "🏦" : "⏰"}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8, textAlign: "center" }}>
          {popup.type === "portal" ? "Portal Check Reminder" : "Task Reminder"}
        </div>
        <div style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7, textAlign: "center", marginBottom: 20 }}>{popup.msg}</div>
        <button onClick={onDismiss} style={{ width: "100%", padding: "11px", background: T.navy, color: T.white, border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Got it — checking now</button>
      </div>
    </div>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
function NotifBell({ count, onClick }) {
  return (
    <button onClick={onClick} style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 7, color: "rgba(255,255,255,0.8)", fontSize: 16, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4 }}>
      🔔
      {count > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: T.red, color: "#fff", borderRadius: "50%", fontSize: 10, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{count > 9 ? "9+" : count}</span>}
    </button>
  );
}

export default function App() {
  const [store, setStore] = useState(init());
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    fetch(`${API_BASE}/data`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        const defaultStore = init();
        let finalUsers = data.users || [];
        if (finalUsers.length > 0 && !finalUsers.find(u => u.id === 'admin')) {
          finalUsers = [defaultStore.users[0], ...finalUsers];
        }
        setStore({
          ...defaultStore,
          users: finalUsers.length > 0 ? finalUsers : defaultStore.users,
          leads: data.leads || [],
          dailyLogs: data.dailyLogs || defaultStore.dailyLogs,
          escalations: data.escalations || defaultStore.escalations,
          portalCheckLog: data.portalCheckLog || defaultStore.portalCheckLog,
          externalFollowups: data.externalFollowups || defaultStore.externalFollowups,
          commLogs: data.commLogs || defaultStore.commLogs,
          notifications: data.notifications || defaultStore.notifications
        });
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timeout);
        console.warn('DB fetch failed, offline mode:', err.message);
        setLoading(false);
      });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const handleFetch = (url, options) => {
    fetch(url, options).then(res => {
      if (!res.ok) alert(`Failed to save data. Server returned ${res.status}. Data may be lost on refresh.`);
    }).catch(err => {
      alert(`Network error: Failed to save data. ${err.message}`);
    });
  };

  const persist = useCallback((newStore) => {
    setStore(oldStore => {
      // Diff Leads
      if (newStore.leads !== oldStore.leads) {
        oldStore.leads.forEach(oldL => {
          if (!newStore.leads.find(l => l.id === oldL.id)) {
            handleFetch(`${API_BASE}/leads/${oldL.id}`, { method: 'DELETE' });
          }
        });
        newStore.leads.forEach(l => {
          const oldL = oldStore.leads.find(x => x.id === l.id);
          if (!oldL) handleFetch(`${API_BASE}/leads`, { method: 'POST', body: JSON.stringify(l), headers: { 'Content-Type': 'application/json' } });
          else if (JSON.stringify(l) !== JSON.stringify(oldL)) handleFetch(`${API_BASE}/leads/${l.id}`, { method: 'PUT', body: JSON.stringify(l), headers: { 'Content-Type': 'application/json' } });
        });
      }
      // Diff Users
      if (newStore.users !== oldStore.users) {
        oldStore.users.forEach(oldU => {
          if (oldU.id !== 'admin' && !newStore.users.find(u => u.id === oldU.id)) {
            handleFetch(`${API_BASE}/users/${oldU.id}`, { method: 'DELETE' });
          }
        });
        newStore.users.forEach(u => {
          const oldU = oldStore.users.find(x => x.id === u.id);
          if (!oldU) handleFetch(`${API_BASE}/users`, { method: 'POST', body: JSON.stringify(u), headers: { 'Content-Type': 'application/json' } });
          else if (JSON.stringify(u) !== JSON.stringify(oldU)) handleFetch(`${API_BASE}/users/${u.id}`, { method: 'PUT', body: JSON.stringify(u), headers: { 'Content-Type': 'application/json' } });
        });
      }

      // Diff System Data
      const sysFields = ['dailyLogs', 'escalations', 'portalCheckLog', 'externalFollowups', 'commLogs', 'notifications'];
      let sysChanged = false;
      const sysPayload = {};
      sysFields.forEach(f => {
        if (newStore[f] !== oldStore[f]) {
          sysChanged = true;
          sysPayload[f] = newStore[f];
        }
      });
      if (sysChanged) {
        handleFetch(`${API_BASE}/system-data`, {
          method: 'PUT',
          body: JSON.stringify(sysPayload),
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return newStore;
    });
  }, []);

  function login(u, p) {
    const cleanU = (u || '').trim().toLowerCase();
    const cleanP = (p || '').trim();
    const user = store.users.find(x => 
      (x.username || '').trim().toLowerCase() === cleanU && 
      (x.password || '').trim() === cleanP && 
      x.active !== false
    );
    if (user) {
      setSession(user);
      return true;
    }
    return false;
  }
  function logout() { setSession(null); }

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${T.navy} 0%,${T.navyMid} 60%,${T.navyLight} 100%)` }}>
      <style>{STYLE}</style>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:T.gold, marginBottom:12 }}>GharKar CDM</div>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[0,1,2].map(i => <div key={i} className="pulse" style={{ width:8, height:8, borderRadius:'50%', background:T.gold, animationDelay:`${i*0.2}s` }} />)}
      </div>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Connecting to database…</div>
    </div>
  );
  if (!session) return <LoginPage onLogin={login} />;
  if (session.role === "admin") return <AdminApp store={store} persist={persist} session={session} onLogout={logout} />;
  if (session.role === "field") return <FieldApp store={store} persist={persist} session={session} onLogout={logout} />;
  if (session.role === "partner") return <PartnerApp store={store} session={session} onLogout={logout} />;
  return <ExecutiveApp store={store} persist={persist} session={session} onLogout={logout} />;
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState(null);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  function submit() { if (!onLogin(u, p)) setErr("Invalid credentials. Please try again."); }
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${T.navy} 0%,${T.navyMid} 55%,${T.navyLight} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <style>{STYLE}</style>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: T.gold, letterSpacing: 1 }}>GharKar CDM</div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4, letterSpacing: 3, textTransform: "uppercase" }}>GharKar CDM A Loan Processing software</div>
      </div>
      {!mode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 380 }} className="fade">
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, marginBottom: 4 }}>Select your login type</p>
          <button onClick={() => setMode("exec")} style={{ background: "transparent", border: `1.5px solid ${T.gold}`, borderRadius: 16, padding: "22px 26px", color: T.white, textAlign: "left", cursor: "pointer" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: T.gold, marginBottom: 4 }}>Executive Login</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Loan Officers & Office Staff — Full 38-step CRM access, analysis, documents, disbursement</div>
          </button>
          <button onClick={() => setMode("field")} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 16, padding: "22px 26px", color: T.white, textAlign: "left", cursor: "pointer" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>Field Agent Login</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Field Representatives — Lead capturing, enquiry, and FIR questionnaire only</div>
          </button>
          <button onClick={() => setMode("exec")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4, textDecoration: "underline", cursor: "pointer" }}>Admin? Use Executive login with admin credentials</button>
        </div>
      ) : (
        <div style={{ background: T.white, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }} className="fade">
          <button onClick={() => { setMode(null); setErr(""); }} style={{ background: "none", border: "none", color: T.textMid, fontSize: 13, marginBottom: 20, cursor: "pointer", padding: 0 }}>← Back</button>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: T.navy, marginBottom: 4 }}>{mode === "field" ? "Field Agent" : "Executive"} Sign In</div>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 24 }}>Enter your credentials provided by your manager</div>
          <label style={LBL}>Username</label>
          <input value={u} onChange={e => setU(e.target.value)} placeholder="your.username" style={{ marginBottom: 12 }} onKeyDown={e => e.key === "Enter" && submit()} />
          <label style={LBL}>Password</label>
          <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" style={{ marginBottom: 6 }} onKeyDown={e => e.key === "Enter" && submit()} />
          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <button onClick={submit} style={{ width: "100%", padding: "12px", background: T.navy, color: T.white, border: "none", borderRadius: 10, fontWeight: 600, fontSize: 15, marginTop: 12, cursor: "pointer" }}>Sign In</button>
        </div>
      )}
    </div>
  );
}

function Shell({ session, onLogout, navItems, children, activeNav, setActiveNav, store, persist }) {
  const rc = session.role === "admin" ? T.gold : session.role === "field" ? "#7C83DB" : T.goldDim;
  const { popup, setPopup, escalationAlert, setEscalationAlert } = useReminders(session, store, persist);
  const [showNotifs, setShowNotifs] = useState(false);
  const myNotifs = (store.notifications || []).filter(n => n.userId === session.id && !n.read);

  function markAllRead() {
    const notifs = (store.notifications || []).map(n => n.userId === session.id ? { ...n, read: true } : n);
    persist({ ...store, notifications: notifs });
    setShowNotifs(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", flexDirection: "column" }}>
      <style>{STYLE}</style>
      <ReminderPopup popup={popup} onDismiss={() => setPopup(null)} />
      {escalationAlert && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,20,55,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: T.white, borderRadius: 18, padding: "28px", maxWidth: 420, width: "100%" }} className="slide">
            <div style={{ fontSize: 24, textAlign: "center", marginBottom: 10 }}>⚠️</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.red, marginBottom: 8, textAlign: "center" }}>Escalation Alert</div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 14 }}>The following tasks have been pending for over 24 hours. Gaurav Sir has been notified.</div>
            {escalationAlert.map((e, i) => (
              <div key={i} style={{ background: T.redBg, borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 13, color: T.red }}>
                <strong>{e.leadName}</strong> — {e.step} ({e.hours}h pending)
              </div>
            ))}
            <button onClick={() => setEscalationAlert(null)} style={{ width: "100%", marginTop: 14, padding: "11px", background: T.red, color: T.white, border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Acknowledged — will resolve now</button>
          </div>
        </div>
      )}
      {showNotifs && (
        <div style={{ position: "fixed", top: 56, right: 16, width: 320, background: T.white, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200, padding: 16 }} className="slide">
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            Notifications {myNotifs.length > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: T.blue, background: "none", border: "none", cursor: "pointer" }}>Mark all read</button>}
          </div>
          {myNotifs.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No new notifications.</div>}
          {myNotifs.slice(0, 8).map(n => (
            <div key={n.id} style={{ padding: "8px 0", borderTop: `0.5px solid ${T.border}`, fontSize: 13, color: T.text }}>
              <div style={{ fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>{n.msg}</div>
            </div>
          ))}
        </div>
      )}
      <header style={{ background: T.navy, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, height: 52, boxShadow: "0 2px 14px rgba(0,0,0,0.22)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.gold, marginRight: 8, whiteSpace: "nowrap" }}>GharKar CDM</div>
        <div style={{ flex: 1, display: "flex", gap: 1, overflowX: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: activeNav === n.id ? "rgba(212,168,83,0.16)" : "transparent", color: activeNav === n.id ? T.gold : T.goldDim, fontSize: 13, fontWeight: activeNav === n.id ? 600 : 400, whiteSpace: "nowrap", cursor: "pointer" }}>{n.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <NotifBell count={myNotifs.length} onClick={() => setShowNotifs(v => !v)} />
          <div style={{ textAlign: "right", display: window.innerWidth > 500 ? "block" : "none" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{session.name}</div>
            <div style={{ fontSize: 10, color: rc, textTransform: "capitalize" }}>{session.role === "field" ? "Field Agent" : session.role === "admin" ? "Administrator" : session.role === "partner" ? "Channel Partner" : "Executive"}</div>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 7, color: "rgba(255,255,255,0.65)", fontSize: 12, padding: "5px 10px" }}>Out</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: "1.25rem 1rem", maxWidth: 960, margin: "0 auto", width: "100%" }} onClick={() => showNotifs && setShowNotifs(false)}>{children}</main>
    </div>
  );
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
const AN = [{ id:"dashboard",label:"Dashboard" },{ id:"users",label:"Users" },{ id:"leads",label:"All Leads" },{ id:"logs",label:"Daily Logs" },{ id:"pipeline",label:"Pipeline" },{ id:"escalations",label:"Escalations" },{ id:"external",label:"External Follow-Ups" },{ id:"calculator",label:"🧲 Calculator" }];
function AdminApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("dashboard");
  const [sel, setSel] = useState(null);
  function updLead(id, upd) { persist({ ...store, leads: (store.leads || []).map(l => l.id === id ? { ...l, ...upd } : l) }); }
  function delLead(id) { if (!window.confirm("Delete this lead permanently?")) return; persist({ ...store, leads: (store.leads || []).filter(l => l.id !== id) }); setSel(null); }
  if (sel) {
    const lead = (store.leads || []).find(l => l.id === sel); if (!lead) { setSel(null); return null; }
    return (<Shell session={session} onLogout={onLogout} navItems={AN} activeNav={nav} setActiveNav={v => { setSel(null); setNav(v); }} store={store} persist={persist}>
      <LeadDetail lead={lead} store={store} onBack={() => setSel(null)} onUpdate={updLead} onDelete={delLead} isAdmin fieldOnly={false} />
    </Shell>);
  }
  return (<Shell session={session} onLogout={onLogout} navItems={AN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "dashboard" && <AdminDash store={store} onSel={setSel} />}
    {nav === "users" && <ManageUsers store={store} persist={persist} />}
    {nav === "leads" && <div className="fade"><ST>All Leads ({(store.leads || []).length})</ST><LeadTable leads={store.leads || []} users={store.users} onSelect={setSel} onDelete={delLead} /></div>}
    {nav === "logs" && <AdminLogs store={store} />}
    {nav === "pipeline" && <AdminPipeline store={store} onSel={setSel} />}
    {nav === "escalations" && <EscalationView store={store} persist={persist} />}
    {nav === "external" && <ExternalFollowups store={store} persist={persist} />}
    {nav === "calculator" && <EMICalculator />}
  </Shell>);
}

function AdminDash({ store, onSel }) {
  const leads = store.leads || [];
  const users = store.users.filter(u => u.role !== "admin");
  const active = leads.filter(l => l.currentStep < 38);
  const done = leads.filter(l => l.currentStep >= 38);
  const todayCalls = leads.filter(l => l.followUp === td() && l.currentStep < 38);
  const overdue = leads.filter(l => l.followUp && l.followUp < td() && l.currentStep < 38);
  const newEscs = (store.escalations || []).filter(e => e.date === td()).length;

  // Lead source breakdown
  const srcBreakdown = {};
  leads.forEach(l => { const src = l.source || "Other"; srcBreakdown[src] = (srcBreakdown[src] || 0) + 1; });

  return (<div className="fade">
    <ST>Admin Dashboard</ST>
    <Grid cols="repeat(auto-fit,minmax(120px,1fr))" gap={10} mb={20}>
      {[{ l: "Total Leads", v: leads.length, c: T.navy }, { l: "Active", v: active.length, c: T.blue }, { l: "Sanction", v: leads.filter(l => STEPS.find(s => s.id === l.currentStep)?.cat === "sanction").length, c: T.purple }, { l: "Disbursed", v: done.length, c: T.green }, { l: "Today's Calls", v: todayCalls.length, c: T.amber }, { l: "Overdue", v: overdue.length, c: overdue.length > 0 ? T.red : T.textLight }, { l: "Escalations", v: newEscs, c: newEscs > 0 ? T.red : T.textLight }, { l: "Staff", v: users.length, c: T.navy }].map(m => (
        <div key={m.l} style={{ background: T.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.textLight }}>{m.l}</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: m.c, marginTop: 2 }}>{m.v}</div>
        </div>
      ))}
    </Grid>

    {/* Lead Source Breakdown */}
    <Card title="Lead Sources">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(srcBreakdown).map(([src, cnt]) => (
          <div key={src} style={{ background: T.cream, borderRadius: 8, padding: "6px 14px", fontSize: 13 }}>
            <span style={{ color: T.textLight }}>{src}: </span><strong style={{ color: T.navy }}>{cnt}</strong>
          </div>
        ))}
        {Object.keys(srcBreakdown).length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No leads yet.</div>}
      </div>
    </Card>

    {overdue.length > 0 && <Alrt c={T.red} bg={T.redBg} title={`${overdue.length} overdue follow-up(s) — action needed`}>
      {overdue.map(l => { const s = STEPS.find(x => x.id === l.currentStep); return (<div key={l.id} onClick={() => onSel(l.id)} style={{ fontSize: 13, padding: "6px 0", borderTop: `0.5px solid ${T.border}`, cursor: "pointer", color: T.red }}>{l.name} · {l.phone} · Step {l.currentStep}: {s?.label} · Due: {l.followUp}</div>); })}
    </Alrt>}

    <Card title="Staff Performance">
      {users.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No staff yet. Create logins in Users tab.</div>}
      {users.map(u => {
        const ml = leads.filter(l => l.assignedTo === u.id); const log = (store.dailyLogs || {})[u.id]?.[td()];
        const myEsc = (store.escalations || []).filter(e => e.staffId === u.id && e.date === td()).length;
        return (<div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `0.5px solid ${T.border}`, opacity: u.active === false ? 0.45 : 1 }}>
          <div><div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{u.name} <Tg c={u.role === "field" ? "#5C6BC0" : u.role === "partner" ? "#0F6E56" : T.navy}>{u.role === "field" ? "Field" : u.role === "partner" ? "Partner" : "Executive"}</Tg>{u.active === false && <Tg c={T.red}>Inactive</Tg>}</div>
            <div style={{ fontSize: 12, color: T.textLight }}>@{u.username} · {ml.length} leads · {ml.filter(l => l.currentStep < 38).length} active{myEsc > 0 ? ` · ⚠️ ${myEsc} escalation` : ""}</div></div>
          <div style={{ fontSize: 12, color: log ? T.green : T.textLight }}>{log ? "✓ Log submitted today" : "No log today"}</div>
        </div>);
      })}
    </Card>
  </div>);
}

function ManageUsers({ store, persist }) {
  const [f, setF] = useState({ name: "", username: "", password: "", role: "executive", partnerCode: "" });
  const [err, setErr] = useState("");
  // FIX: filter correctly excluding only the hardcoded admin id
  const users = store.users.filter(u => u.id !== "admin");

  function create() {
    if (!f.name || !f.username || !f.password) { setErr("All fields required"); return; }
    if (store.users.find(u => u.username === f.username)) { setErr("Username already exists"); return; }
    const nu = { name: f.name, username: f.username, password: f.password, role: f.role, id: gid(), active: true, createdAt: td() };
    if (f.role === "partner") nu.partnerCode = f.partnerCode || f.username;
    persist({ ...store, users: [...store.users, nu] });
    setF({ name: "", username: "", password: "", role: "executive", partnerCode: "" }); setErr("");
  }

  function toggle(id) {
    const updated = store.users.map(u => u.id === id ? { ...u, active: u.active === false ? true : false } : u);
    persist({ ...store, users: updated });
  }

  // FIX: delete now correctly filters by id and rebuilds array properly
  function del(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    const updated = store.users.filter(u => u.id !== id);
    persist({ ...store, users: updated });
  }

  return (<div className="fade">
    <ST>Manage Users</ST>
    <Card title="Create new login">
      <Grid cols="1fr 1fr" gap={10} mb={10}>
        <F l="Full Name"><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Rahul Sharma" /></F>
        <F l="Username"><input value={f.username} onChange={e => setF(x => ({ ...x, username: e.target.value }))} placeholder="rahul.sharma" /></F>
        <F l="Password"><input value={f.password} onChange={e => setF(x => ({ ...x, password: e.target.value }))} placeholder="Set a password" /></F>
        <F l="Role"><select value={f.role} onChange={e => setF(x => ({ ...x, role: e.target.value }))}>
          <option value="executive">Executive (Full CRM — all 38 steps)</option>
          <option value="field">Field Agent (Lead capture & enquiry only)</option>
          <option value="partner">Channel Partner (view own leads status only)</option>
        </select></F>
      </Grid>
      {f.role === "partner" && <div style={{ marginBottom: 10 }}><F l="Partner Code (optional)"><input value={f.partnerCode} onChange={e => setF(x => ({ ...x, partnerCode: e.target.value }))} placeholder="e.g. CP001" /></F></div>}
      {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <Btn onClick={create} c={T.navy}>Create Login</Btn>
    </Card>
    <Card title={`All staff (${users.length})`}>
      {users.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No staff yet.</div>}
      {users.map(u => (
        <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `0.5px solid ${T.border}`, opacity: u.active === false ? 0.5 : 1 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{u.name} <Tg c={u.role === "field" ? "#5C6BC0" : u.role === "partner" ? "#0F6E56" : T.navy}>{u.role === "field" ? "Field Agent" : u.role === "partner" ? "Channel Partner" : "Executive"}</Tg></div>
            <div style={{ fontSize: 12, color: T.textLight }}>@{u.username}{u.partnerCode ? ` · Code: ${u.partnerCode}` : ""} · Created {u.createdAt} · {(store.leads || []).filter(l => l.assignedTo === u.id).length} leads</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => toggle(u.id)} style={{ fontSize: 12, padding: "5px 10px", border: `1px solid ${T.border}`, borderRadius: 7, background: T.white, color: u.active === false ? T.green : T.amber, cursor: "pointer" }}>{u.active === false ? "Activate" : "Deactivate"}</button>
            <button onClick={() => del(u.id)} style={{ fontSize: 12, padding: "5px 10px", border: `1px solid ${T.red}`, borderRadius: 7, background: T.white, color: T.red, cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
    </Card>
  </div>);
}

function AdminLogs({ store }) {
  const users = store.users.filter(u => u.role !== "admin");
  const [selU, setSelU] = useState(users[0]?.id || "");
  const myLogs = (store.dailyLogs || {})[selU] || {};
  const dates = Object.keys(myLogs).sort().reverse();
  const user = users.find(u => u.id === selU);
  return (<div className="fade">
    <ST>Daily Logs</ST>
    <select value={selU} onChange={e => setSelU(e.target.value)} style={{ maxWidth: 280, marginBottom: 16 }}>
      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role === "field" ? "Field" : u.role === "partner" ? "Partner" : "Executive"})</option>)}
    </select>
    {dates.length === 0 && selU && <div style={{ fontSize: 13, color: T.textLight }}>No logs submitted by {user?.name} yet.</div>}
    {dates.map(d => (
      <div key={d} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ fontWeight: 500, fontSize: 13, color: T.textMid, marginBottom: 8 }}>{new Date(d).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
        <div style={{ fontSize: 13, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{myLogs[d]}</div>
      </div>
    ))}
  </div>);
}

function AdminPipeline({ store, onSel }) {
  const leads = store.leads || [];
  // Visual pipeline by doc stage
  const docStages = ["round1", "round2", "round3"];
  const docStageLeads = {
    round1: leads.filter(l => { const s = STEPS.find(x => x.id === l.currentStep); return s?.docStage === "round1"; }),
    round2: leads.filter(l => { const s = STEPS.find(x => x.id === l.currentStep); return s?.docStage === "round2"; }),
    round3: leads.filter(l => { const s = STEPS.find(x => x.id === l.currentStep); return s?.docStage === "round3"; }),
  };
  const cats = [...new Set(STEPS.map(s => s.cat))];
  return (<div className="fade">
    <ST>Pipeline Overview</ST>

    {/* 3-stage doc pipeline visual */}
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.textMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Document Collection Stages</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {docStages.map(ds => (
          <div key={ds} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.blue, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>{DOC_STAGE_LABELS[ds]}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.navy, marginBottom: 8 }}>{docStageLeads[ds].length}</div>
            {docStageLeads[ds].slice(0, 3).map(l => (
              <div key={l.id} onClick={() => onSel(l.id)} style={{ fontSize: 12, color: T.textMid, cursor: "pointer", padding: "3px 0", borderTop: `0.5px solid ${T.border}` }}>{l.name}</div>
            ))}
            {docStageLeads[ds].length > 3 && <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>+{docStageLeads[ds].length - 3} more</div>}
          </div>
        ))}
      </div>
    </div>

    {leads.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No leads yet.</div>}
    {cats.map(cat => {
      const cm = CAT_META[cat];
      const cl = leads.filter(l => { const st = STEPS.find(s => s.id === l.currentStep); return st?.cat === cat; });
      if (!cl.length) return null;
      return (<div key={cat} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: cm.color, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{cm.label} ({cl.length})</div>
        {cl.map(l => {
          const step = STEPS.find(s => s.id === l.currentStep); const asgn = store.users.find(u => u.id === l.assignedTo);
          return (<div key={l.id} onClick={() => onSel(l.id)} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${cm.color}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}>
            <div><div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{l.name}</div>
              <div style={{ fontSize: 12, color: T.textLight }}>Step {l.currentStep}: {step?.label} · {asgn?.name || "Unassigned"}</div></div>
            <div style={{ fontSize: 11, color: l.followUp && l.followUp < td() ? T.red : T.textLight, textAlign: "right" }}>{l.followUp ? "↻ " + l.followUp : "No follow-up"}</div>
          </div>);
        })}
      </div>);
    })}
  </div>);
}

function EscalationView({ store, persist }) {
  const escs = (store.escalations || []).slice(0, 50);
  return (<div className="fade">
    <ST>Escalation Alerts</ST>
    <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Tasks that were pending for over 24 hours. These are auto-generated when a staff member is stuck on a step.</div>
    {escs.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No escalations yet.</div>}
    {escs.map(e => (
      <div key={e.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.red}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{e.staffName}</div>
          <div style={{ fontSize: 12, color: T.textLight }}>{e.date}</div>
        </div>
        {e.items.map((item, i) => (
          <div key={i} style={{ fontSize: 13, color: T.red, padding: "4px 0", borderTop: `0.5px solid ${T.border}` }}>
            {item.leadName} — {item.step} ({item.hours}h pending)
          </div>
        ))}
      </div>
    ))}
  </div>);
}

function ExternalFollowups({ store, persist }) {
  const [form, setForm] = useState({ type: "Advocate", name: "", leadId: "", deadline: "", notes: "" });
  const leads = store.leads || [];
  const followups = store.externalFollowups || [];

  function add() {
    if (!form.name || !form.leadId) return;
    const nf = { ...form, id: gid(), createdAt: td(), done: false };
    persist({ ...store, externalFollowups: [nf, ...followups] });
    setForm({ type: "Advocate", name: "", leadId: "", deadline: "", notes: "" });
  }
  function markDone(id) {
    persist({ ...store, externalFollowups: followups.map(f => f.id === id ? { ...f, done: true } : f) });
  }
  const pending = followups.filter(f => !f.done);
  const done = followups.filter(f => f.done);

  return (<div className="fade">
    <ST>External Follow-Ups</ST>
    <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Track advocates (legal reports) and valuers (property evaluation). They must respond within 2–3 days.</div>
    <Card title="Add external follow-up">
      <Grid cols="1fr 1fr" gap={10} mb={10}>
        <F l="Type"><select value={form.type} onChange={e => setForm(x => ({ ...x, type: e.target.value }))}>
          <option>Advocate</option><option>Valuer</option><option>Bank RM</option><option>Other</option>
        </select></F>
        <F l="Name / Firm"><input value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Adv. Mehta" /></F>
        <F l="Related Lead"><select value={form.leadId} onChange={e => setForm(x => ({ ...x, leadId: e.target.value }))}>
          <option value="">Select lead...</option>
          {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select></F>
        <F l="Report Deadline"><input type="date" value={form.deadline} onChange={e => setForm(x => ({ ...x, deadline: e.target.value }))} /></F>
      </Grid>
      <F l="Notes"><textarea value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} rows={2} placeholder="What report is pending?" style={{ marginBottom: 10, resize: "vertical" }} /></F>
      <Btn onClick={add} c={T.navy}>Add Follow-Up</Btn>
    </Card>
    {pending.length > 0 && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 8 }}>Pending ({pending.length})</div>
        {pending.map(f => {
          const lead = leads.find(l => l.id === f.leadId);
          const isOverdue = f.deadline && f.deadline < td();
          return (<div key={f.id} style={{ background: T.white, border: `1px solid ${isOverdue ? T.red : T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: T.text }}>{f.type}: {f.name}</div>
              <div style={{ fontSize: 12, color: T.textLight }}>Lead: {lead?.name || "—"} · Due: {f.deadline || "Not set"}{isOverdue ? <span style={{ color: T.red }}> OVERDUE</span> : ""}</div>
              {f.notes && <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{f.notes}</div>}
            </div>
            <button onClick={() => markDone(f.id)} style={{ fontSize: 12, padding: "5px 12px", border: `1px solid ${T.green}`, borderRadius: 7, background: T.white, color: T.green, cursor: "pointer", whiteSpace: "nowrap" }}>Mark Done</button>
          </div>);
        })}
      </div>
    )}
    {done.length > 0 && (
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.green, marginBottom: 8 }}>Completed ({done.length})</div>
        {done.slice(0, 5).map(f => {
          const lead = leads.find(l => l.id === f.leadId);
          return (<div key={f.id} style={{ background: T.greenBg, border: `1px solid #A5D6A7`, borderRadius: 10, padding: "8px 14px", marginBottom: 4, fontSize: 13, color: T.green, display: "flex", justifyContent: "space-between" }}>
            <span>{f.type}: {f.name} · {lead?.name || "—"}</span><span style={{ fontSize: 11 }}>✓ Done</span>
          </div>);
        })}
      </div>
    )}
  </div>);
}

// ─── EXECUTIVE APP ────────────────────────────────────────────────────────────
const EN = [{ id:"today",label:"Today" },{ id:"leads",label:"My Leads" },{ id:"add",label:"Add Lead" },{ id:"followups",label:"Follow-Ups" },{ id:"guide",label:"Process Guide" },{ id:"external",label:"External" },{ id:"log",label:"Daily Log" },{ id:"calculator",label:"🧲 Calculator" }];
function ExecutiveApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("today"); const [sel, setSel] = useState(null);
  const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id);
  function updLead(id, upd) { persist({ ...store, leads: (store.leads || []).map(l => l.id === id ? { ...l, ...upd } : l) }); }
  function delLead(id) { if (!window.confirm("Delete this lead permanently?")) return; persist({ ...store, leads: (store.leads || []).filter(l => l.id !== id) }); setSel(null); }
  function addLead(lead) {
    const nl = { ...lead, id: gid(), assignedTo: session.id, currentStep: 1, stepsCompleted: {}, notes: [], followUp: "", stageHistory: [{ step: 1, date: td() }], createdAt: td(), commLog: [] };
    // Auto welcome notification log
    const commLog = [{ type: "system", msg: `Lead created. Welcome message auto-triggered for ${lead.name}.`, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }];
    nl.commLog = commLog;
    persist({ ...store, leads: [nl, ...(store.leads || [])] });
    setNav("leads");
  }
  function saveLog(text) { const logs = { ...(store.dailyLogs || {}) }; if (!logs[session.id]) logs[session.id] = {}; logs[session.id][td()] = text; persist({ ...store, dailyLogs: logs }); }
  if (sel) {
    const lead = myLeads.find(l => l.id === sel); if (!lead) { setSel(null); return null; }
    return (<Shell session={session} onLogout={onLogout} navItems={EN} activeNav={nav} setActiveNav={v => { setSel(null); setNav(v); }} store={store} persist={persist}>
      <LeadDetail lead={lead} store={store} onBack={() => setSel(null)} onUpdate={updLead} onDelete={delLead} isAdmin={false} fieldOnly={false} />
    </Shell>);
  }
  return (<Shell session={session} onLogout={onLogout} navItems={EN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "today" && <TodayView leads={myLeads} session={session} onSel={setSel} />}
    {nav === "leads" && <div className="fade"><ST>My Leads</ST><LeadTable leads={myLeads} users={store.users} onSelect={setSel} onDelete={delLead} /></div>}
    {nav === "add" && <AddLeadForm onAdd={addLead} />}
    {nav === "followups" && <FollowUps leads={myLeads} onSel={setSel} onUpdate={updLead} />}
    {nav === "guide" && <StepGuide />}
    {nav === "external" && <ExecExternal store={store} persist={persist} session={session} />}
    {nav === "log" && <DailyLog session={session} dailyLogs={store.dailyLogs || {}} onSave={saveLog} />}
    {nav === "calculator" && <EMICalculator />}
  </Shell>);
}

function ExecExternal({ store, persist, session }) {
  const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id);
  const followups = (store.externalFollowups || []).filter(f => { const lead = myLeads.find(l => l.id === f.leadId); return !!lead; });
  const [form, setForm] = useState({ type: "Advocate", name: "", leadId: "", deadline: "", notes: "" });

  function add() {
    if (!form.name || !form.leadId) return;
    const nf = { ...form, id: gid(), createdAt: td(), done: false, staffId: session.id };
    persist({ ...store, externalFollowups: [nf, ...(store.externalFollowups || [])] });
    setForm({ type: "Advocate", name: "", leadId: "", deadline: "", notes: "" });
  }
  function markDone(id) { persist({ ...store, externalFollowups: (store.externalFollowups || []).map(f => f.id === id ? { ...f, done: true } : f) }); }
  const pending = followups.filter(f => !f.done);

  return (<div className="fade">
    <ST>External Follow-Ups</ST>
    <Card title="Add advocate / valuer follow-up">
      <Grid cols="1fr 1fr" gap={10} mb={10}>
        <F l="Type"><select value={form.type} onChange={e => setForm(x => ({ ...x, type: e.target.value }))}>
          <option>Advocate</option><option>Valuer</option><option>Bank RM</option><option>Other</option>
        </select></F>
        <F l="Name"><input value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="Adv. / Valuer name" /></F>
        <F l="Lead"><select value={form.leadId} onChange={e => setForm(x => ({ ...x, leadId: e.target.value }))}>
          <option value="">Select lead...</option>
          {myLeads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select></F>
        <F l="Deadline"><input type="date" value={form.deadline} onChange={e => setForm(x => ({ ...x, deadline: e.target.value }))} /></F>
      </Grid>
      <F l="Notes"><textarea value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} rows={2} style={{ marginBottom: 10, resize: "vertical" }} /></F>
      <Btn onClick={add} c={T.navy}>Add</Btn>
    </Card>
    {pending.map(f => {
      const lead = myLeads.find(l => l.id === f.leadId); const isOD = f.deadline && f.deadline < td();
      return (<div key={f.id} style={{ background: T.white, border: `1px solid ${isOD ? T.red : T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div><div style={{ fontWeight: 500, fontSize: 13, color: T.text }}>{f.type}: {f.name}</div>
          <div style={{ fontSize: 12, color: T.textLight }}>Lead: {lead?.name || "—"} · Due: {f.deadline || "Not set"}{isOD ? <span style={{ color: T.red }}> OVERDUE</span> : ""}</div></div>
        <button onClick={() => markDone(f.id)} style={{ fontSize: 12, padding: "5px 10px", border: `1px solid ${T.green}`, borderRadius: 7, background: T.white, color: T.green, cursor: "pointer" }}>Done</button>
      </div>);
    })}
    {pending.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No pending external follow-ups.</div>}
  </div>);
}

// ─── FIELD APP ────────────────────────────────────────────────────────────────
const FN = [{ id: "today", label: "Today" }, { id: "leads", label: "My Leads" }, { id: "add", label: "Add Lead" }, { id: "log", label: "Daily Log" }];
function FieldApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("today"); const [sel, setSel] = useState(null);
  const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id);
  function addLead(lead) { const nl = { ...lead, id: gid(), assignedTo: session.id, currentStep: 1, stepsCompleted: {}, notes: [], followUp: "", stageHistory: [{ step: 1, date: td() }], createdAt: td(), commLog: [] }; persist({ ...store, leads: [nl, ...(store.leads || [])] }); setNav("leads"); }
  function updLead(id, upd) { persist({ ...store, leads: (store.leads || []).map(l => l.id === id ? { ...l, ...upd } : l) }); }
  function delLead(id) { if (!window.confirm("Delete this lead permanently?")) return; persist({ ...store, leads: (store.leads || []).filter(l => l.id !== id) }); setSel(null); }
  function saveLog(text) { const logs = { ...(store.dailyLogs || {}) }; if (!logs[session.id]) logs[session.id] = {}; logs[session.id][td()] = text; persist({ ...store, dailyLogs: logs }); }
  if (sel) {
    const lead = myLeads.find(l => l.id === sel); if (!lead) { setSel(null); return null; }
    return (<Shell session={session} onLogout={onLogout} navItems={FN} activeNav={nav} setActiveNav={v => { setSel(null); setNav(v); }} store={store} persist={persist}>
      <LeadDetail lead={lead} store={store} onBack={() => setSel(null)} onUpdate={updLead} onDelete={delLead} isAdmin={false} fieldOnly={true} />
    </Shell>);
  }
  return (<Shell session={session} onLogout={onLogout} navItems={FN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "today" && <TodayView leads={myLeads} session={session} onSel={setSel} />}
    {nav === "leads" && <div className="fade"><ST>My Leads</ST><LeadTable leads={myLeads} users={store.users} onSelect={setSel} onDelete={delLead} /></div>}
    {nav === "add" && <AddLeadForm onAdd={addLead} />}
    {nav === "log" && <DailyLog session={session} dailyLogs={store.dailyLogs || {}} onSave={saveLog} />}
  </Shell>);
}

// ─── CHANNEL PARTNER APP ─────────────────────────────────────────────────────
function PartnerApp({ store, session, onLogout }) {
  const [nav, setNav] = useState("mystatus");
  const myLeads = (store.leads || []).filter(l => l.source === "Channel Partner" && l.partnerRef === session.username);
  const PN = [{ id: "mystatus", label: "My Leads Status" }];
  return (<Shell session={session} onLogout={onLogout} navItems={PN} activeNav={nav} setActiveNav={setNav} store={store} persist={() => { }}>
    <div className="fade">
      <ST>My Referred Leads — Status</ST>
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>You can view the current status of leads you have referred. Contact the office for any queries.</div>
      {myLeads.length === 0 && <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, textAlign: "center", color: T.textLight, fontSize: 14 }}>No leads found under your partner code yet.</div>}
      {myLeads.map(l => {
        const step = STEPS.find(s => s.id === l.currentStep); const cm = CAT_META[step?.cat] || {};
        return (<div key={l.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${cm.color}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
          <div style={{ fontWeight: 500, fontSize: 15, color: T.text }}>{l.name}</div>
          <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>{l.loanType} · ₹{l.loanAmount ? Number(l.loanAmount).toLocaleString("en-IN") : "—"}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <Tg c={cm.color}>{cm.label}</Tg>
            <span style={{ fontSize: 12, color: T.textMid }}>Step {l.currentStep}: {step?.label}</span>
          </div>
          {/* Partner sees status only - no sensitive data */}
        </div>);
      })}
    </div>
  </Shell>);
}

// ─── TODAY VIEW ───────────────────────────────────────────────────────────────
function TodayView({ leads, session, onSel }) {
  const todayCalls = leads.filter(l => l.followUp === td() && l.currentStep < 38);
  const overdue = leads.filter(l => l.followUp && l.followUp < td() && l.currentStep < 38);
  const active = leads.filter(l => l.currentStep < 38);
  const noFU = leads.filter(l => !l.followUp && l.currentStep < 38);
  const hr = new Date().getHours();

  // Portal check reminder banner
  const needsPortal = active.some(l => { const s = STEPS.find(x => x.id === l.currentStep); return s?.portalCheck; });

  return (<div className="fade">
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Good {hr < 12 ? "morning" : hr < 18 ? "afternoon" : "evening"}, {session.name.split(" ")[0]}.</div>
    <div style={{ fontSize: 13, color: T.textLight, marginBottom: 18 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>

    {needsPortal && (
      <div style={{ background: "#E8F0FB", border: "1px solid #90CAF9", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 18 }}>🏦</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: T.blue }}>Daily Portal Check Required</div>
          <div style={{ fontSize: 12, color: T.textMid }}>You have active cases at bank login / sanction / disbursement stage. Log in to bank portals now to check for queries or updates.</div>
        </div>
      </div>
    )}

    <Grid cols="repeat(auto-fit,minmax(110px,1fr))" gap={10} mb={18}>
      {[{ l: "Total", v: leads.length, c: T.navy }, { l: "Active", v: active.length, c: T.blue }, { l: "Sanction", v: leads.filter(l => STEPS.find(s => s.id === l.currentStep)?.cat === "sanction").length, c: T.purple }, { l: "Today's Calls", v: todayCalls.length, c: T.green }, { l: "Overdue", v: overdue.length, c: overdue.length > 0 ? T.red : T.textLight }].map(m => (
        <div key={m.l} style={{ background: T.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.textLight }}>{m.l}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: m.c, marginTop: 2 }}>{m.v}</div>
        </div>
      ))}
    </Grid>
    {overdue.length > 0 && <Alrt c={T.red} bg={T.redBg} title={`${overdue.length} overdue — call now`}>{overdue.map(l => <CC key={l.id} lead={l} onSel={onSel} urgent />)}</Alrt>}
    {todayCalls.length > 0 && <Alrt c={T.green} bg={T.greenBg} title={`Today's calls (${todayCalls.length})`}>{todayCalls.map(l => <CC key={l.id} lead={l} onSel={onSel} />)}</Alrt>}
    {noFU.length > 0 && <Alrt c={T.amber} bg={T.amberBg} title={`No follow-up set (${noFU.length})`}>{noFU.map(l => <CC key={l.id} lead={l} onSel={onSel} />)}</Alrt>}
    {active.filter(l => l.followUp && l.followUp > td()).length > 0 && <Card title="Upcoming">{active.filter(l => l.followUp && l.followUp > td()).map(l => <CC key={l.id} lead={l} onSel={onSel} />)}</Card>}
  </div>);
}
function CC({ lead, onSel, urgent }) {
  const step = STEPS.find(s => s.id === lead.currentStep); const cm = CAT_META[step?.cat] || {};
  return (<div onClick={() => onSel(lead.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `0.5px solid ${T.border}`, cursor: "pointer", gap: 10 }}>
    <div><div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{lead.name} <span style={{ fontSize: 12, color: T.textLight }}>· {lead.phone}</span></div>
      <div style={{ fontSize: 12, color: cm.color }}>Step {lead.currentStep}: {step?.label}</div></div>
    <div style={{ fontSize: 11, color: urgent ? T.red : T.textLight, whiteSpace: "nowrap" }}>{lead.followUp}</div>
  </div>);
}

// ─── LEAD DETAIL ──────────────────────────────────────────────────────────────
function LeadDetail({ lead, store, onBack, onUpdate, onDelete, isAdmin, fieldOnly }) {
  const [tab, setTab] = useState("current");
  const [note, setNote] = useState("");
  const [commNote, setCommNote] = useState("");
  const [commType, setCommType] = useState("WhatsApp");
  const [fu, setFu] = useState(lead.followUp || "");
  const step = STEPS.find(s => s.id === lead.currentStep) || STEPS[0];
  const cm = CAT_META[step.cat];
  const done = lead.stepsCompleted?.[step.id] || {};
  const allDone = step.actions.every(a => !!done[a]);
  const asgn = store.users.find(u => u.id === lead.assignedTo);
  const maxStep = fieldOnly ? Math.max(...LEAD_STEP_IDS) : 39;
  const tabs = fieldOnly ? ["current", "notes", "history"] : ["current", "allsteps", "comm", "docchecklist", "aidocs", "notes", "history"];

  // FIX: use functional update to avoid stale closure mutation
  function toggleA(action) {
    const prev = lead.stepsCompleted || {};
    const prevStep = prev[step.id] || {};
    const newVal = !prevStep[action];
    const updated = {
      ...prev,
      [step.id]: { ...prevStep, [action]: newVal }
    };
    onUpdate(lead.id, { stepsCompleted: updated });
  }

  function nextS() {
    if (lead.currentStep >= maxStep) return;
    const next = lead.currentStep + 1;
    onUpdate(lead.id, { currentStep: next, stageHistory: [...(lead.stageHistory || []), { step: next, date: td() }] });
  }
  function addNote() {
    if (!note.trim()) return;
    const notes = [...(lead.notes || []), { text: note.trim(), date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }];
    onUpdate(lead.id, { notes }); setNote("");
  }
  function addComm() {
    if (!commNote.trim()) return;
    const commLog = [...(lead.commLog || []), { type: commType, msg: commNote.trim(), date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), by: asgn?.name || "" }];
    onUpdate(lead.id, { commLog }); setCommNote("");
  }
  const pct = Math.round(((lead.currentStep - 1) / (maxStep - 1)) * 100);

  // doc stage of current step
  const curDocStage = step.docStage;

  return (<div className="fade">
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.textMid, fontSize: 13, marginBottom: 12, cursor: "pointer", padding: 0 }}>← Back</button>
      {onDelete && <button onClick={() => onDelete(lead.id)} style={{ background: "none", border: "none", color: T.red, fontSize: 13, marginBottom: 12, cursor: "pointer", padding: 0 }}>Delete Lead</button>}
    </div>
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.navy }}>{lead.name}</div>
          <div style={{ fontSize: 13, color: T.textLight, marginTop: 2 }}>{lead.phone}{lead.email && ` · ${lead.email}`}</div>
          <div style={{ fontSize: 13, color: T.textLight }}>{lead.loanType} · ₹{lead.loanAmount ? Number(lead.loanAmount).toLocaleString("en-IN") : "—"} · ₹{lead.income ? Number(lead.income).toLocaleString("en-IN") : "—"}/mo</div>
          {asgn && <div style={{ fontSize: 12, color: T.textLight }}>Assigned: {asgn.name}</div>}
          {lead.source && <div style={{ fontSize: 12, color: T.textLight }}>Source: {lead.source}{lead.partnerRef ? ` (${lead.partnerRef})` : ""}</div>}
          {curDocStage && <div style={{ marginTop: 4 }}><Tg c={T.blue}>{DOC_STAGE_LABELS[curDocStage]}</Tg></div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Tg c={cm.color}>{cm.label}</Tg>
          <div style={{ fontSize: 11, color: T.textLight }}>Step {lead.currentStep} of {maxStep}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <label style={{ fontSize: 12, color: T.textLight }}>↻</label>
            <input type="date" value={fu} onChange={e => { setFu(e.target.value); onUpdate(lead.id, { followUp: e.target.value }); }} style={{ width: 145, fontSize: 12, padding: "4px 8px" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 12 }}>
        <div style={{ flex: 1, background: T.creamDark, borderRadius: 4, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: cm.color, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: T.textLight }}>{pct}%</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 1, marginBottom: 14, borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
      {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 14px", border: "none", background: "none", color: tab === t ? cm.color : T.textLight, fontWeight: tab === t ? 600 : 400, borderBottom: tab === t ? `2px solid ${cm.color}` : "2px solid transparent", cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap", fontSize: 13 }}>
        {t === "current" ? "Current Step" : t === "allsteps" ? "All 39 Steps" : t === "comm" ? "Communication" : t === "docchecklist" ? "📋 Doc Checklist" : t === "aidocs" ? "🤖 AI Docs" : t}
      </button>)}
    </div>

    {tab === "current" && (
      <div>
        {step.portalCheck && (
          <div style={{ background: "#E8F0FB", border: "1px solid #90CAF9", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: T.blue, display: "flex", gap: 8, alignItems: "center" }}>
            <span>🏦</span><span><strong>Portal check required for this step.</strong> Log in to the bank portal daily to check for queries or updates.</span>
          </div>
        )}
        {step.advocateCheck && (
          <div style={{ background: T.purpleBg, border: "1px solid #CE93D8", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: T.purple, display: "flex", gap: 8, alignItems: "center" }}>
            <span>⚖️</span><span><strong>Legal advocate follow-up required.</strong> Ensure advocate provides report within 2–3 days.</span>
          </div>
        )}
        {step.valuationCheck && (
          <div style={{ background: T.amberBg, border: "1px solid #FFD54F", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: T.amber, display: "flex", gap: 8, alignItems: "center" }}>
            <span>🏠</span><span><strong>Valuation follow-up required.</strong> Ensure valuer provides report within 2–3 days.</span>
          </div>
        )}
        <div style={{ background: cm.bg, border: `1px solid ${cm.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: cm.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Step {step.id} of {maxStep} · {cm.label}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: cm.color, marginBottom: 10 }}>{step.label}</div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.75, marginBottom: 14 }}>{step.desc}</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: cm.color, marginBottom: 8 }}>Actions to complete:</div>
          {step.actions.map((a, i) => {
            // FIX: read fresh from lead prop each render
            const isDone = !!(lead.stepsCompleted?.[step.id]?.[a]);
            return (<div key={i} onClick={() => toggleA(a)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: `0.5px solid ${cm.border}`, cursor: "pointer" }}>
              <div style={{ minWidth: 22, height: 22, borderRadius: 6, border: `1.5px solid ${isDone ? cm.color : T.border}`, background: isDone ? cm.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                {isDone && <svg width="12" height="10"><path d="M1 5l4 4 6-7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
              </div>
              <span style={{ fontSize: 13, color: isDone ? T.textLight : T.text, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.6 }}>{a}</span>
            </div>);
          })}
        </div>
        {lead.currentStep < maxStep && (
          <Card>
            <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 4 }}>Ready to advance?</div>
            <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>{allDone ? "All actions done. You can move to the next step." : "Tick all actions above before advancing."}</div>
            <Btn onClick={() => { if (!allDone && !window.confirm("Not all actions ticked. Advance anyway?")) return; nextS(); }} c={allDone ? cm.color : T.textLight}>
              Move to Step {lead.currentStep + 1}: {STEPS.find(s => s.id === lead.currentStep + 1)?.label} →
            </Btn>
          </Card>
        )}
        {lead.currentStep >= maxStep && <div style={{ background: T.greenBg, borderRadius: 12, padding: 14, fontSize: 14, color: T.green, fontWeight: 500 }}>{fieldOnly ? "Lead steps done! Office team takes over." : "All 38 steps complete. Congratulations!"}</div>}
      </div>
    )}

    {tab === "allsteps" && !fieldOnly && (
      <div className="fade">
        {[...new Set(STEPS.map(s => s.cat))].map(cat => {
          const cm2 = CAT_META[cat];
          return (<div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: cm2.color, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{cm2.label}</div>
            {STEPS.filter(s => s.cat === cat).map(s => {
              const isCur = s.id === lead.currentStep, isPast = s.id < lead.currentStep;
              return (<div key={s.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", borderRadius: 8, marginBottom: 3, background: isCur ? cm2.bg : isPast ? T.greenBg : T.white, border: `0.5px solid ${isCur ? cm2.border : isPast ? "#C8E6C9" : T.border}` }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: isCur ? cm2.color : isPast ? T.green : T.creamDark, color: isCur || isPast ? "#fff" : T.textLight, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, flexShrink: 0 }}>{isPast ? "✓" : s.id}</div>
                <div style={{ fontSize: 13, color: isCur ? cm2.color : isPast ? T.green : T.textMid, fontWeight: isCur ? 600 : 400, flex: 1 }}>{s.label}</div>
                {s.portalCheck && <span style={{ fontSize: 10, color: T.blue, background: T.blueBg, padding: "2px 6px", borderRadius: 10 }}>Portal</span>}
              </div>);
            })}
          </div>);
        })}
      </div>
    )}

    {tab === "comm" && !fieldOnly && (
      <div className="fade">
        {/* ── WhatsApp Quick Templates ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 4 }}>💬 One-Click WhatsApp Templates</div>
          <div style={{ fontSize: 12, color: T.textLight, marginBottom: 12 }}>Click any template to open WhatsApp with a pre-filled personalised message for {lead.name}.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WA_TEMPLATES.map(tpl => {
              const phone = (lead.phone || "").replace(/\D/g, "");
              const intlPhone = phone.length === 10 ? `91${phone}` : phone;
              const msg = encodeURIComponent(tpl.msg(lead));
              return (
                <a key={tpl.id} href={`https://wa.me/${intlPhone}?text=${msg}`} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "#1B5E20", textDecoration: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                  title={tpl.msg(lead)}>
                  <span>{tpl.icon}</span> {tpl.label}
                </a>
              );
            })}
          </div>
        </div>
        {/* ── Manual Log ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 8 }}>Log communication manually</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {["WhatsApp", "Email", "Call", "Meeting"].map(ct => (
              <button key={ct} onClick={() => setCommType(ct)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, border: `1px solid ${commType === ct ? cm.color : T.border}`, background: commType === ct ? cm.bg : "transparent", color: commType === ct ? cm.color : T.textMid, cursor: "pointer" }}>{ct}</button>
            ))}
          </div>
          <textarea value={commNote} onChange={e => setCommNote(e.target.value)} placeholder={`Log ${commType} with client...`} rows={3} style={{ marginBottom: 10, resize: "vertical" }} />
          <Btn onClick={addComm} c={cm.color}>Log Communication</Btn>
        </div>
        {/* ── History ── */}
        {(lead.commLog || []).length > 0 && <div style={{ fontSize: 12, color: T.textLight, marginBottom: 8 }}>All communications for this client in one place:</div>}
        {(lead.commLog || []).slice().reverse().map((c, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{c.type === "WhatsApp" ? "💬" : c.type === "Email" ? "📧" : c.type === "Call" ? "📞" : c.type === "Meeting" ? "🤝" : "⚙️"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: cm.color }}>{c.type}</span>
                <span style={{ fontSize: 11, color: T.textLight }}>{c.date} {c.time}{c.by ? ` · ${c.by}` : ""}</span>
              </div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6, marginTop: 3, whiteSpace: "pre-wrap" }}>{c.msg}</div>
            </div>
          </div>
        ))}
        {!(lead.commLog || []).length && <div style={{ fontSize: 13, color: T.textLight }}>No communication logged yet.</div>}
      </div>
    )}

    {tab === "docchecklist" && !fieldOnly && <DocChecklistTab lead={lead} onUpdate={onUpdate} />}
    {tab === "aidocs" && !fieldOnly && <AiDocsTab lead={lead} />}

    {tab === "notes" && (
      <div className="fade">
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add call notes, client response, remarks..." rows={3} style={{ marginBottom: 10, resize: "vertical" }} />
          <Btn onClick={addNote} c={cm.color}>Add Note</Btn>
        </div>
        {(lead.notes || []).slice().reverse().map((n, i) => (
          <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: T.textLight, marginBottom: 4 }}>{n.date} at {n.time}</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{n.text}</div>
          </div>
        ))}
        {!(lead.notes || []).length && <div style={{ fontSize: 13, color: T.textLight }}>No notes yet. Add after every call.</div>}
      </div>
    )}

    {tab === "history" && (
      <Card title="Stage History">
        {(lead.stageHistory || []).map((h, i) => {
          const s = STEPS.find(x => x.id === h.step); const cm2 = CAT_META[s?.cat] || {};
          return (<div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: cm2.color || T.border, flexShrink: 0, marginTop: 3 }} />
              {i < (lead.stageHistory || []).length - 1 && <div style={{ width: 2, flex: 1, background: T.border, marginTop: 3 }} />}
            </div>
            <div style={{ paddingBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: cm2.color || T.text }}>Step {h.step}: {s?.label}</div>
              <div style={{ fontSize: 12, color: T.textLight }}>{new Date(h.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</div>
            </div>
          </div>);
        })}
      </Card>
    )}
  </div>);
}

// ─── AI DOCS TAB ─────────────────────────────────────────────────────────────
function AiDocsTab({ lead }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const empType = lead.employmentType || "Salaried";
  const docSet = DOC_REQUIREMENTS[empType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.values(docSet).flat();

  async function analyse() {
    if (!text.trim()) return;
    setLoading(true);
    const res = await analyseDocumentsAI(empType, lead.currentStep, text, lead);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="fade">
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>
        Paste or type what documents you have received. AI will identify what is present, missing, and what to do next.
        <span style={{ marginLeft: 8, fontSize: 11, color: T.blue, background: T.blueBg, padding: "2px 8px", borderRadius: 10 }}>{empType}</span>
      </div>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: T.textLight, marginBottom: 8 }}>Example: "Received Aadhaar and PAN. Got 3 months salary slips and 6 months bank statements. Form 16 pending. Property agreement received but EC not available yet."</div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder={`Describe received documents for ${lead.name || "this client"}...`} style={{ marginBottom: 10, resize: "vertical" }} />
        <button onClick={analyse} disabled={loading || !text.trim()} style={{ padding: "10px 22px", background: loading ? T.textLight : T.navy, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Analysing..." : "🤖 Analyse Documents"}
        </button>
        {result && <span style={{ marginLeft: 10, fontSize: 11, color: T.textLight }}>{result.source === "gemini" ? "✨ Powered by Gemini AI" : "⚙️ Rule Engine (Gemini unavailable)"}</span>}
      </div>
      {result && (
        <div className="fade">
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Document Readiness Score</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: result.score >= 80 ? T.green : result.score >= 50 ? T.amber : T.red }}>{result.score}%</div>
            </div>
            <div style={{ background: T.creamDark, borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${result.score}%`, height: "100%", background: result.score >= 80 ? T.green : result.score >= 50 ? T.amber : T.red, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
          </div>
          <div style={{ background: T.blueBg, border: "1px solid #90CAF9", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: T.blue, marginBottom: 4 }}>📋 Next Recommended Action</div>
            <div style={{ fontSize: 13, color: T.text }}>{result.nextAction}</div>
          </div>
          {result.confirmed?.length > 0 && (
            <div style={{ background: T.greenBg, border: "1px solid #A5D6A7", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.green, marginBottom: 8 }}>✅ Confirmed ({result.confirmed.length} of {allDocs.length})</div>
              {result.confirmed.map((d, i) => <div key={i} style={{ fontSize: 13, color: T.green, padding: "3px 0", borderTop: `0.5px solid #A5D6A7` }}>• {d}</div>)}
            </div>
          )}
          {result.missing?.length > 0 && (
            <div style={{ background: T.redBg, border: "1px solid #EF9A9A", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.red, marginBottom: 8 }}>❌ Missing ({result.missing.length})</div>
              {result.missing.map((d, i) => <div key={i} style={{ fontSize: 13, color: T.red, padding: "3px 0", borderTop: `0.5px solid #EF9A9A` }}>• {d}</div>)}
            </div>
          )}
          {result.concerns?.length > 0 && (
            <div style={{ background: T.amberBg, border: "1px solid #FFD54F", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.amber, marginBottom: 8 }}>⚠️ Concerns</div>
              {result.concerns.map((c, i) => <div key={i} style={{ fontSize: 13, color: T.amber, padding: "3px 0", borderTop: `0.5px solid #FFD54F` }}>• {c}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DOC CHECKLIST TAB ────────────────────────────────────────────────────────
function DocChecklistTab({ lead, onUpdate }) {
  const empType = lead.employmentType || "Salaried";
  const docSet = DOC_REQUIREMENTS[empType] || DOC_REQUIREMENTS["Salaried"];
  const received = lead.docsReceived || {};
  const allDocs = Object.values(docSet).flat();
  const checkedCount = allDocs.filter(d => received[d]).length;

  function toggleDoc(doc) {
    onUpdate(lead.id, { docsReceived: { ...received, [doc]: !received[doc] } });
  }

  return (
    <div className="fade">
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Documents — {empType}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: checkedCount === allDocs.length ? T.green : T.amber }}>{checkedCount} / {allDocs.length} collected</div>
        </div>
        <div style={{ background: T.creamDark, borderRadius: 4, height: 7, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ width: `${Math.round((checkedCount / allDocs.length) * 100)}%`, height: "100%", background: checkedCount === allDocs.length ? T.green : T.amber, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: T.textLight }}>{Math.round((checkedCount / allDocs.length) * 100)}% complete — tick each document as you receive it</div>
      </div>
      {Object.entries(docSet).map(([cat, docs]) => (
        <div key={cat} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: T.navy, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>{cat} ({docs.filter(d => received[d]).length}/{docs.length})</div>
          {docs.map((doc, i) => {
            const done = !!received[doc];
            return (
              <div key={i} onClick={() => toggleDoc(doc)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: `0.5px solid ${T.border}`, cursor: "pointer" }}>
                <div style={{ minWidth: 20, height: 20, borderRadius: 5, border: `1.5px solid ${done ? T.green : T.border}`, background: done ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {done && <svg width="11" height="9"><path d="M1 4.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
                </div>
                <span style={{ fontSize: 13, color: done ? T.textLight : T.text, textDecoration: done ? "line-through" : "none", flex: 1 }}>{doc}</span>
                {done && <span style={{ fontSize: 11, color: T.green, flexShrink: 0 }}>✓ Received</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function LeadTable({ leads, users, onSelect, onDelete }) {
  const [q, setQ] = useState(""); const [fs, setFs] = useState("all"); const [src, setSrc] = useState("all");
  const fl = leads.filter(l => {
    const ms = l.name.toLowerCase().includes(q.toLowerCase()) || (l.phone || "").includes(q);
    const mst = fs === "all" || String(l.currentStep) === fs;
    const msrc = src === "all" || (l.source || "") === src;
    return ms && mst && msrc;
  });
  return (<div>
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or phone..." style={{ flex: 1, minWidth: 140 }} />
      <select value={src} onChange={e => setSrc(e.target.value)} style={{ minWidth: 160 }}>
        <option value="all">All sources</option>
        {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
      </select>
      <select value={fs} onChange={e => setFs(e.target.value)} style={{ minWidth: 170 }}>
        <option value="all">All steps</option>
        {STEPS.map(s => <option key={s.id} value={s.id}>Step {s.id}: {s.label}</option>)}
      </select>
    </div>
    {fl.length === 0 && <div style={{ fontSize: 13, color: T.textLight, padding: "16px 0" }}>No leads found.</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {fl.map(l => {
        const step = STEPS.find(s => s.id === l.currentStep); const cm = CAT_META[step?.cat] || {}; const asgn = users?.find(u => u.id === l.assignedTo);
        return (<div key={l.id} onClick={() => onSelect(l.id)} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${cm.color || T.border}`, borderRadius: 10, padding: "11px 15px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{l.name}</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 1 }}>{l.phone} · {l.loanType}{asgn ? ` · ${asgn.name}` : ""}</div>
            {l.source && <div style={{ fontSize: 11, color: T.textLight }}>Source: {l.source}</div>}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <Tg c={cm.color || T.textLight}>Step {l.currentStep}</Tg>
            <div style={{ fontSize: 11, color: T.textLight, marginTop: 3, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{step?.label}</div>
            {l.followUp && <div style={{ fontSize: 11, color: l.followUp < td() ? T.red : T.textLight, marginTop: 2 }}>↻ {l.followUp}</div>}
            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(l.id); }} style={{ marginTop: 6, background: T.redBg, border: `1px solid ${T.red}`, color: T.red, fontSize: 10, borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontWeight: 600 }}>Delete</button>}
          </div>
        </div>);
      })}
    </div>
  </div>);
}


function AddLeadForm({ onAdd }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", loanType: "Home Purchase", loanAmount: "", income: "", city: "", propertyType: "Flat", employmentType: "Salaried", coApplicant: "", source: "Referral", partnerRef: "", notes: "" });
  const [errs, setErrs] = useState({});
  const s = (k, v) => { setF(p => ({ ...p, [k]: v })); setErrs(e => ({ ...e, [k]: "" })); };

  function validate() {
    const e = {};
    if (!f.name.trim()) e.name = "Full name is required";
    if (!f.phone.trim()) e.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = "Invalid mobile number — must be exactly 10 digits";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Invalid email — enter a valid email address";
    if (!f.loanAmount) e.loanAmount = "Loan amount is required";
    if (!f.income) e.income = "Monthly income is required";
    if (!f.city.trim()) e.city = "City is required";
    if (!f.coApplicant.trim()) e.coApplicant = "Co-applicant name is required";
    if (!f.partnerRef.trim()) e.partnerRef = "Partner / referral name is required";
    if (!f.notes.trim()) e.notes = "Initial remarks are required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function Err({ field }) {
    return errs[field] ? <div style={{ color: T.red, fontSize: 11, marginTop: 3 }}>{errs[field]}</div> : null;
  }

  return (<div className="fade">
    <ST>Add New Lead</ST>
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <Grid cols="1fr 1fr" gap={10}>
        <div><F l="Full Name *"><input value={f.name} onChange={e => s("name", e.target.value)} placeholder="Client full name" style={{ borderColor: errs.name ? T.red : undefined }} /></F><Err field="name" /></div>
        <div><F l="Mobile Number *"><input value={f.phone} onChange={e => s("phone", e.target.value)} placeholder="10-digit mobile number" maxLength={10} style={{ borderColor: errs.phone ? T.red : undefined }} /></F><Err field="phone" /></div>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <div><F l="Email *"><input value={f.email} onChange={e => s("email", e.target.value)} placeholder="email@example.com" style={{ borderColor: errs.email ? T.red : undefined }} /></F><Err field="email" /></div>
        <F l="Loan Type"><select value={f.loanType} onChange={e => s("loanType", e.target.value)}>{["Home Purchase", "Balance Transfer", "Top-Up Loan", "Construction Loan", "Plot + Construction", "LAP"].map(t => <option key={t}>{t}</option>)}</select></F>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <div><F l="Loan Amount (₹) *"><input type="number" value={f.loanAmount} onChange={e => s("loanAmount", e.target.value)} placeholder="e.g. 5000000" style={{ borderColor: errs.loanAmount ? T.red : undefined }} /></F><Err field="loanAmount" /></div>
        <div><F l="Monthly Income (₹) *"><input type="number" value={f.income} onChange={e => s("income", e.target.value)} placeholder="e.g. 80000" style={{ borderColor: errs.income ? T.red : undefined }} /></F><Err field="income" /></div>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <div><F l="City *"><input value={f.city} onChange={e => s("city", e.target.value)} placeholder="Property city" style={{ borderColor: errs.city ? T.red : undefined }} /></F><Err field="city" /></div>
        <F l="Property Type"><select value={f.propertyType} onChange={e => s("propertyType", e.target.value)}>{["Flat", "Independent House", "Plot", "Commercial", "Under Construction"].map(t => <option key={t}>{t}</option>)}</select></F>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <F l="Employment Type"><select value={f.employmentType} onChange={e => s("employmentType", e.target.value)}>{["Salaried", "Self-Employed", "Pvt Ltd Company", "Partnership Firm", "NRI"].map(t => <option key={t}>{t}</option>)}</select></F>
        <div><F l="Co-Applicant *"><input value={f.coApplicant} onChange={e => s("coApplicant", e.target.value)} placeholder="Name (if any)" style={{ borderColor: errs.coApplicant ? T.red : undefined }} /></F><Err field="coApplicant" /></div>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <F l="Lead Source"><select value={f.source} onChange={e => s("source", e.target.value)}>{LEAD_SOURCES.map(t => <option key={t}>{t}</option>)}</select></F>
        <div><F l="Partner / Referral Name *"><input value={f.partnerRef} onChange={e => s("partnerRef", e.target.value)} placeholder="Channel partner / referrer name" style={{ borderColor: errs.partnerRef ? T.red : undefined }} /></F><Err field="partnerRef" /></div>
      </Grid>
      <div><F l="Initial Remarks / FIR Notes *"><textarea value={f.notes} onChange={e => s("notes", e.target.value)} placeholder={"FIR notes from first call:\n• Purpose: Home purchase\n• Property: 2BHK flat in Pune\n• Timeline: 3 months"} rows={3} style={{ resize: "vertical", borderColor: errs.notes ? T.red : undefined }} /></F><Err field="notes" /></div>
      <div>
        <Btn onClick={() => { if (validate()) onAdd(f); }} c={T.navy}>Add Lead → Start Step 1</Btn>
        <div style={{ fontSize: 12, color: T.textLight, marginTop: 8 }}>A welcome communication log will be auto-created when this lead is saved.</div>
      </div>
    </div>
  </div>);
}


function FollowUps({ leads, onSel, onUpdate }) {
  const secs = [
    { l: "Overdue", leads: leads.filter(l => l.followUp && l.followUp < td() && l.currentStep < 38), c: T.red },
    { l: "Today", leads: leads.filter(l => l.followUp === td() && l.currentStep < 38), c: T.green },
    { l: "This week", leads: leads.filter(l => { if (!l.followUp || l.followUp <= td() || l.currentStep >= 38) return false; const d = new Date(l.followUp), t = new Date(); t.setDate(t.getDate() + 7); return d <= t; }), c: T.blue },
    { l: "No follow-up set", leads: leads.filter(l => !l.followUp && l.currentStep < 38), c: T.textLight },
  ];
  return (<div className="fade">
    <ST>Follow-Up Calendar</ST>
    {secs.map(sec => sec.leads.length > 0 && (
      <div key={sec.l} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: sec.c, marginBottom: 8 }}>{sec.l} ({sec.leads.length})</div>
        {sec.leads.map(l => {
          const step = STEPS.find(s => s.id === l.currentStep); const cm = CAT_META[step?.cat] || {};
          return (<div key={l.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div onClick={() => onSel(l.id)} style={{ cursor: "pointer", flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{l.name} <span style={{ fontSize: 12, color: T.textLight }}>· {l.phone}</span></div>
              <div style={{ fontSize: 12, color: cm.color }}>Step {l.currentStep}: {step?.label}</div>
            </div>
            <input type="date" defaultValue={l.followUp || ""} onChange={e => onUpdate(l.id, { followUp: e.target.value })} style={{ width: 148, fontSize: 12, padding: "5px 8px" }} />
          </div>);
        })}
      </div>
    ))}
  </div>);
}

function StepGuide() {
  const [sel, setSel] = useState(1);
  const step = STEPS.find(s => s.id === sel); const cm = CAT_META[step.cat];
  const cats = [...new Set(STEPS.map(s => s.cat))];
  return (<div className="fade">
    <ST>Process Guide — All 38 Steps</ST>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      <div style={{ minWidth: 190, flex: "0 0 190px", maxHeight: "75vh", overflowY: "auto" }}>
        {cats.map(cat => {
          const cm2 = CAT_META[cat]; return (<div key={cat} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: cm2.color, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, paddingLeft: 4 }}>{cm2.label}</div>
            {STEPS.filter(s => s.cat === cat).map(s => (
              <button key={s.id} onClick={() => setSel(s.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", border: "none", borderRadius: 7, background: sel === s.id ? cm2.bg : "transparent", color: sel === s.id ? cm2.color : T.textMid, fontSize: 13, fontWeight: sel === s.id ? 600 : 400, cursor: "pointer", marginBottom: 2 }}>
                <span style={{ color: T.textLight, fontSize: 11 }}>{s.id}. </span>{s.label}
              </button>
            ))}
          </div>);
        })}
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ background: cm.bg, border: `1px solid ${cm.border}`, borderRadius: 14, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: cm.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Step {step.id} · {cm.label}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: cm.color, marginBottom: 10 }}>{step.label}</div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.75 }}>{step.desc}</div>
          {step.portalCheck && <div style={{ marginTop: 10, fontSize: 12, color: T.blue, background: T.blueBg, padding: "6px 10px", borderRadius: 8 }}>🏦 Daily bank portal check required at this step</div>}
          {step.docStage && <div style={{ marginTop: 6, fontSize: 12, color: T.blue, background: T.blueBg, padding: "6px 10px", borderRadius: 8 }}>📁 {DOC_STAGE_LABELS[step.docStage]}</div>}
        </div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 10 }}>Actions / Checklist</div>
          {step.actions.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: `0.5px solid ${T.border}` }}>
              <div style={{ width: 19, height: 19, borderRadius: 5, border: `1.5px solid ${cm.color}`, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{a}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {sel > 1 && <button onClick={() => setSel(sel - 1)} style={{ padding: "9px 18px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.white, color: T.text, fontSize: 13, cursor: "pointer" }}>← Prev</button>}
          {sel < 38 && <button onClick={() => setSel(sel + 1)} style={{ padding: "9px 18px", background: cm.color, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Next →</button>}
        </div>
      </div>
    </div>
  </div>);
}

function DailyLog({ session, dailyLogs, onSave }) {
  const myLogs = dailyLogs[session.id] || {};
  const [entry, setEntry] = useState(myLogs[td()] || "");
  const dates = Object.keys(myLogs).sort().reverse();
  return (<div className="fade">
    <ST>Daily Log</ST>
    <p style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Write what you did today. Your manager reviews this daily. Be specific — mention client names, steps done, and any issues.</p>
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ fontWeight: 500, fontSize: 14, color: T.text, marginBottom: 8 }}>Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</div>
      <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder={"Example:\n• Called Rahul Mehta – docs still pending. Sent reminder on WhatsApp.\n• HDFC file login done for Priya Shah – App no. HD123456. Updated MIS.\n• OCR sheet prepared for Amit Verma. FOIR at 48%, eligible.\n• Legal initiated for Suresh Kumar file – property at Baner, Pune."} rows={8} style={{ resize: "vertical", marginBottom: 10 }} />
      <Btn onClick={() => { onSave(entry); alert("Log saved!"); }} c={T.navy}>Save Today's Log</Btn>
    </div>
    {dates.filter(d => d !== td()).map(d => (
      <div key={d} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 6 }}>{new Date(d).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
        <div style={{ fontSize: 13, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{myLogs[d]}</div>
      </div>
    ))}
  </div>);
}

// ─── EMI / FOIR / LTV CALCULATOR ─────────────────────────────────────────────
function EMICalculator() {
  const [tab, setTab] = useState("emi");
  // EMI tab
  const [loan, setLoan] = useState(""); const [rate, setRate] = useState(""); const [tenure, setTenure] = useState("240");
  // FOIR tab
  const [income, setIncome] = useState(""); const [existEMI, setExistEMI] = useState("0"); const [fRate, setFRate] = useState("8.75"); const [fTenure, setFTenure] = useState("240");
  // LTV tab
  const [propVal, setPropVal] = useState(""); const [ltvType, setLtvType] = useState("flat");

  function calcEMI(p, r, n) { const mr = r / 12 / 100; if (!mr) return p / n; return Math.round(p * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1)); }
  function calcMaxLoan(inc, existE, r, n, foir = 0.50) { const maxE = inc * foir - existE; if (maxE <= 0) return 0; const mr = r / 12 / 100; if (!mr) return maxE * n; return Math.round(maxE * (Math.pow(1 + mr, n) - 1) / (mr * Math.pow(1 + mr, n))); }

  const emi = loan && rate && tenure ? calcEMI(+loan, +rate, +tenure) : null;
  const totalPay = emi ? emi * +tenure : null;
  const totalInt = totalPay ? totalPay - +loan : null;
  const intPct = totalPay ? Math.round((totalInt / totalPay) * 100) : 0;

  const maxLoan = income && fRate && fTenure ? calcMaxLoan(+income, +(existEMI || 0), +fRate, +fTenure) : null;
  const maxEMI = income ? +income * 0.5 - +(existEMI || 0) : null;
  const foirUsed = income && existEMI ? Math.round((+existEMI / +income) * 100) : 0;

  const LTV_MAP = { flat: 80, plot: 70, commercial: 60, construction: 75 };
  const ltvPct = LTV_MAP[ltvType] || 80;
  const maxByLTV = propVal ? Math.round(+propVal * ltvPct / 100) : null;

  const tabs = [{ id: "emi", label: "EMI Calculator" }, { id: "foir", label: "FOIR / Eligibility" }, { id: "ltv", label: "LTV Check" }];

  const GS = `
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .calc-in{animation:slideUp 0.35s ease}
    .calc-bar{transition:width 0.7s cubic-bezier(.4,0,.2,1)}
  `;

  function Stat({ label, value, sub, color, big }) {
    return (
      <div style={{ textAlign: "center", padding: "16px 10px" }}>
        <div style={{ fontSize: big ? 32 : 22, fontWeight: 700, color: color || T.navy, fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{sub}</div>}
      </div>
    );
  }

  function inp(label, val, set, placeholder, prefix) {
    return (
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>{label}</label>
        <div style={{ position: "relative" }}>
          {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.textMid, fontWeight: 600 }}>{prefix}</span>}
          <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={{ paddingLeft: prefix ? 26 : 13 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fade">
      <style>{GS}</style>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.navy, marginBottom: 6 }}>🧮 Loan Calculator</div>
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 20 }}>Calculate EMI, check loan eligibility, and verify LTV for any client.</div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.creamDark, borderRadius: 12, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 9, background: tab === t.id ? T.navy : "transparent", color: tab === t.id ? T.gold : T.textMid, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>{t.label}</button>
        ))}
      </div>

      {/* ── EMI TAB ── */}
      {tab === "emi" && (
        <div className="calc-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {inp("Loan Amount (₹)", loan, setLoan, "e.g. 5000000", "₹")}
            {inp("Annual Interest Rate (%)", rate, setRate, "e.g. 8.75")}
            {inp("Tenure (months)", tenure, setTenure, "240 = 20 years")}
          </div>
          {emi && (
            <div className="calc-in">
              {/* Hero EMI card */}
              <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`, borderRadius: 18, padding: "28px 24px", marginBottom: 14, textAlign: "center", boxShadow: "0 12px 40px rgba(11,20,55,0.25)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Monthly EMI</div>
                <div style={{ fontSize: 44, fontWeight: 700, color: T.gold, fontFamily: "'Playfair Display',serif", letterSpacing: -1 }}>₹{emi.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>for {tenure} months · ₹{(+loan).toLocaleString("en-IN")} @ {rate}%</div>
              </div>
              {/* Breakdown row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { l: "Principal", v: `₹${(+loan).toLocaleString("en-IN")}`, c: T.blue },
                  { l: "Total Interest", v: `₹${totalInt.toLocaleString("en-IN")}`, c: T.amber },
                  { l: "Total Payment", v: `₹${totalPay.toLocaleString("en-IN")}`, c: T.purple },
                ].map(m => (
                  <div key={m.l} style={{ background: T.white, borderRadius: 12, padding: "14px 10px", textAlign: "center", border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 11, color: T.textLight, marginTop: 3 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              {/* Principal vs Interest bar */}
              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>Principal vs Interest Split</div>
                <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", marginBottom: 8 }}>
                  <div className="calc-bar" style={{ width: `${100 - intPct}%`, background: `linear-gradient(90deg,${T.blue},${T.navyLight})` }} />
                  <div className="calc-bar" style={{ width: `${intPct}%`, background: `linear-gradient(90deg,${T.amber},${T.gold})` }} />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ color: T.blue }}>● Principal: {100 - intPct}%</span>
                  <span style={{ color: T.amber }}>● Interest: {intPct}%</span>
                </div>
              </div>
            </div>
          )}
          {!emi && <div style={{ fontSize: 13, color: T.textLight, padding: "24px 0", textAlign: "center" }}>Enter loan amount, interest rate, and tenure to calculate EMI.</div>}
        </div>
      )}

      {/* ── FOIR TAB ── */}
      {tab === "foir" && (
        <div className="calc-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {inp("Monthly Income (₹)", income, setIncome, "e.g. 80000", "₹")}
            {inp("Existing EMIs (₹)", existEMI, setExistEMI, "0 if none", "₹")}
            {inp("Expected Interest Rate (%)", fRate, setFRate, "e.g. 8.75")}
            {inp("Desired Tenure (months)", fTenure, setFTenure, "240 = 20 years")}
          </div>
          {maxLoan !== null && (
            <div className="calc-in">
              <div style={{ background: `linear-gradient(135deg, #0F6E56 0%, #1A7A4A 100%)`, borderRadius: 18, padding: "28px 24px", marginBottom: 14, textAlign: "center", boxShadow: "0 12px 40px rgba(26,122,74,0.25)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Maximum Eligible Loan</div>
                <div style={{ fontSize: 44, fontWeight: 700, color: "#FFE57F", fontFamily: "'Playfair Display',serif", letterSpacing: -1 }}>₹{maxLoan.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Based on 50% FOIR at {fRate}% for {fTenure} months</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { l: "Max New EMI", v: `₹${Math.max(0, maxEMI).toLocaleString("en-IN")}`, c: T.green },
                  { l: "Existing FOIR", v: `${foirUsed}%`, c: foirUsed > 40 ? T.red : T.amber },
                  { l: "Available FOIR", v: `${Math.max(0, 50 - foirUsed)}%`, c: T.blue },
                ].map(m => (
                  <div key={m.l} style={{ background: T.white, borderRadius: 12, padding: "14px 10px", textAlign: "center", border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 11, color: T.textLight, marginTop: 3 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              {/* FOIR gauge */}
              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>FOIR Gauge</span>
                  <span style={{ fontSize: 12, color: foirUsed > 45 ? T.red : T.green, fontWeight: 600 }}>{foirUsed}% used (limit: 50%)</span>
                </div>
                <div style={{ background: T.creamDark, borderRadius: 7, height: 12, overflow: "hidden" }}>
                  <div className="calc-bar" style={{ width: `${Math.min(foirUsed * 2, 100)}%`, height: "100%", background: foirUsed > 40 ? `linear-gradient(90deg,${T.amber},${T.red})` : `linear-gradient(90deg,${T.green},#4CAF50)`, borderRadius: 7 }} />
                </div>
                {maxLoan === 0 && <div style={{ marginTop: 10, fontSize: 13, color: T.red, fontWeight: 500 }}>⚠️ Existing EMIs exceed 50% FOIR limit. Client may not be eligible.</div>}
              </div>
            </div>
          )}
          {maxLoan === null && <div style={{ fontSize: 13, color: T.textLight, padding: "24px 0", textAlign: "center" }}>Enter income and existing EMIs to calculate loan eligibility.</div>}
        </div>
      )}

      {/* ── LTV TAB ── */}
      {tab === "ltv" && (
        <div className="calc-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {inp("Property Value (₹)", propVal, setPropVal, "e.g. 8000000", "₹")}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Property Type</label>
              <select value={ltvType} onChange={e => setLtvType(e.target.value)}>
                <option value="flat">Flat / Apartment (80% LTV)</option>
                <option value="construction">Under Construction (75% LTV)</option>
                <option value="plot">Plot / Land (70% LTV)</option>
                <option value="commercial">Commercial (60% LTV)</option>
              </select>
            </div>
          </div>
          {maxByLTV && (
            <div className="calc-in">
              <div style={{ background: `linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)`, borderRadius: 18, padding: "28px 24px", marginBottom: 14, textAlign: "center", boxShadow: "0 12px 40px rgba(106,27,154,0.25)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Max Loan by LTV ({ltvPct}%)</div>
                <div style={{ fontSize: 44, fontWeight: 700, color: "#E1BEE7", fontFamily: "'Playfair Display',serif", letterSpacing: -1 }}>₹{maxByLTV.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Property value ₹{(+propVal).toLocaleString("en-IN")} × {ltvPct}%</div>
              </div>
              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>LTV Breakdown</div>
                <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                  <div className="calc-bar" style={{ width: `${ltvPct}%`, background: `linear-gradient(90deg,${T.purple},#AB47BC)` }} />
                  <div className="calc-bar" style={{ width: `${100 - ltvPct}%`, background: T.creamDark }} />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ color: T.purple }}>● Bank Finances: {ltvPct}% = ₹{maxByLTV.toLocaleString("en-IN")}</span>
                  <span style={{ color: T.textLight }}>● Client brings: {100 - ltvPct}% = ₹{(+propVal - maxByLTV).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: T.textLight, lineHeight: 1.7 }}>
                  <strong style={{ color: T.amber }}>Note:</strong> Final loan amount = lower of (FOIR eligibility) and (LTV cap). Always check both before applying.
                </div>
              </div>
            </div>
          )}
          {!maxByLTV && <div style={{ fontSize: 13, color: T.textLight, padding: "24px 0", textAlign: "center" }}>Enter property value to calculate the maximum loan by LTV norms.</div>}
        </div>
      )}
    </div>
  );
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const LBL = { fontSize: 12, fontWeight: 600, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 };
function ST({ children }) { return <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: T.navy, marginBottom: 18 }}>{children}</div>; }
function Card({ title, children }) { return <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 13, padding: 16, marginBottom: 14 }}>{title && <div style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 12 }}>{title}</div>}{children}</div>; }
function Alrt({ c, bg, title, children }) { return <div style={{ background: bg, border: `1px solid ${c}40`, borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}><div style={{ fontWeight: 600, fontSize: 13, color: c, marginBottom: 8 }}>{title}</div>{children}</div>; }
function Tg({ c, children }) { return <span style={{ fontSize: 11, background: `${c}18`, color: c, padding: "2px 9px", borderRadius: 20, fontWeight: 600, display: "inline-block", marginLeft: 4 }}>{children}</span>; }
function Btn({ onClick, c, children }) { return <button onClick={onClick} style={{ padding: "10px 22px", background: c, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{children}</button>; }
function Grid({ cols, gap, mb, children }) { return <div style={{ display: "grid", gridTemplateColumns: cols, gap, marginBottom: mb }}>{children}</div>; }
function F({ l, children }) { return <div><label style={LBL}>{l}</label>{children}</div>; }
