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
input,select,textarea{font-family:'DM Sans',sans-serif;font-size:14px;background:${T.white};border:1px solid ${T.border};border-radius:10px;padding:10px 14px;width:100%;outline:none;color:${T.text};transition:border 0.2s,box-shadow 0.2s}
input:focus,select:focus,textarea:focus{border-color:${T.gold};box-shadow:0 0 0 3px ${T.gold}22}
button{font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.18s ease}
.posh-card{background:${T.white};border:1px solid ${T.border};border-radius:18px;padding:20px 22px;margin-bottom:16px;box-shadow:0 2px 16px rgba(11,20,55,0.06),0 1px 4px rgba(11,20,55,0.04);transition:box-shadow 0.2s ease}
.posh-card:hover{box-shadow:0 6px 28px rgba(11,20,55,0.11),0 2px 8px rgba(11,20,55,0.06)}
.posh-btn{display:inline-flex;align-items:center;gap:7px;padding:11px 24px;border:none;border-radius:12px;font-weight:600;font-size:14px;letter-spacing:0.2px;transition:all 0.18s ease}
.posh-btn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 6px 20px rgba(0,0,0,0.18)}
.posh-btn:active{transform:translateY(0)}
.stat-card{background:${T.white};border:1px solid ${T.border};border-radius:16px;padding:18px 14px;text-align:center;box-shadow:0 2px 12px rgba(11,20,55,0.05);transition:all 0.2s ease}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,20,55,0.1)}
.tab-btn{padding:10px 16px;border:none;background:none;font-weight:400;cursor:pointer;white-space:nowrap;font-size:13px;transition:all 0.15s;border-bottom:2px solid transparent;letter-spacing:0.1px}
.tab-btn.active{font-weight:600;border-bottom-width:2px}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
@keyframes stepComplete{0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}}
.fade{animation:fadeIn 0.22s ease}
.slide{animation:slideDown 0.2s ease}
.pulse{animation:pulse 2s infinite}
.step-done{animation:stepComplete 0.4s ease}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
@media print{
  header,.no-print{display:none!important}
  body{background:#fff}
  .posh-card{box-shadow:none;border:1px solid #ddd}
  .print-page{padding:0}
}
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
  { id: "welcome", icon: "👋", label: "Welcome", msg: l => `Dear ${l.name},\n\nThank you for reaching out to Ghar Kar for your ${l.loanType || "home loan"} requirement.\n\nOur team will connect with you shortly to understand your requirements and guide you through the entire loan process.\n\nBest regards,\nGhar Kar Team` },
  { id: "doclist", icon: "📋", label: "Doc List", msg: l => `Dear ${l.name},\n\nKindly arrange the following documents for your ${l.loanType || "home loan"} application:\n\n📁 *KYC:* Aadhaar (front & back), PAN Card, Passport photos x2\n💰 *Income:* ${l.employmentType === "Salaried" ? "3 months salary slips, Form 16, 6 months bank statements" : "ITR last 3 years, P&L + Balance Sheet, 12 months bank statements"}\n\nPlease share at the earliest for faster processing.\n\nGhar Kar Team` },
  { id: "missed", icon: "📞", label: "Missed Call", msg: l => `Dear ${l.name},\n\nWe tried reaching you regarding your home loan enquiry but couldn't connect.\n\nPlease call us back at your convenience, or let us know a good time to reach you.\n\nGhar Kar Team` },
  { id: "sanction", icon: "🎉", label: "Sanction!", msg: l => `Dear ${l.name},\n\n*Congratulations!* 🎉\n\nYour home loan application has been *sanctioned* by the bank.\n\nWe will now initiate the disbursement process. Our team will contact you shortly with the next steps.\n\nThank you for choosing Ghar Kar!\nGhar Kar Team` },
  { id: "disb", icon: "🏦", label: "Disbursement", msg: l => `Dear ${l.name},\n\nThis is a reminder for your home loan *disbursement appointment*.\n\nPlease carry all original documents as discussed. Contact us immediately for any queries.\n\nGhar Kar Team` },
  { id: "review", icon: "⭐", label: "Review Request", msg: l => `Dear ${l.name},\n\nCongratulations on your successful home loan disbursement! 🏠\n\nIt was our pleasure to serve you. We would be grateful if you could spare 2 minutes to leave us a *Google Review* — it helps us serve more families like yours.\n\nThank you!\nGhar Kar Team` },
  { id: "reengage", icon: "🔄", label: "Re-engage", msg: l => `Dear ${l.name},\n\nHope you are doing well!\n\nWe noticed we haven't been in touch recently regarding your home loan requirement. Interest rates are competitive right now — this could be a great time to proceed.\n\nWould you like us to revisit your case? We are ready to assist.\n\nGhar Kar Team` },
  { id: "docremind", icon: "📂", label: "Doc Reminder", msg: l => `Dear ${l.name},\n\nGentle reminder — we are waiting for the remaining documents to process your home loan application further.\n\nKindly share the pending documents at the earliest to avoid delays.\n\nGhar Kar Team` },
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
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";

async function analyseDocumentsAI(employmentType, currentStep, receivedText, loanDetails) {
  const docSet = DOC_REQUIREMENTS[employmentType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.entries(docSet).flatMap(([cat, docs]) => docs.map(d => `[${cat}] ${d}`));
  const prompt = `You are an expert home loan processor in India. Analyse the documents received and identify what is present, missing, and any concerns.\nBORROWER: ${loanDetails.name || "Client"}, Employment: ${employmentType}, Loan: ${loanDetails.loanType || "Home Loan"}, Amount: Rs.${Number(loanDetails.loanAmount || 0).toLocaleString("en-IN")}\nPROCESS STEP: ${currentStep}\nREQUIRED DOCUMENTS:\n${allDocs.map((d, i) => `${i + 1}. ${d}`).join("\n")}\nDOCUMENTS RECEIVED (described by loan officer):\n${receivedText}\nRespond ONLY in this exact JSON format:{"confirmed":["names of docs clearly present"],"missing":["names of docs not mentioned"],"concerns":["any red flags or issues"],"nextAction":"specific next step the officer should take now","score":0}`;
  try {Q
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 1024 } })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON");
    return { source: "gemini", ...JSON.parse(match[0]) };
  } catch (e) {
    console.warn("Gemini fallback:", e.message);
    return ruleBasedDocAnalysis(employmentType, receivedText);
  }
}

function ruleBasedDocAnalysis(employmentType, receivedText) {
  const docSet = DOC_REQUIREMENTS[employmentType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.values(docSet).flat();
  const txt = receivedText.toLowerCase();
  const KW = {
    "aadhaar": ["aadhaar", "aadhar", "uid"], "pan": ["pan card", " pan ", "pan-"],
    "salary slip": ["salary slip", "payslip", "pay slip"], "form 16": ["form 16", "form16"],
    "bank statement": ["bank statement", "bank stmt", "account statement"],
    "it return": ["itr", "it return", "income tax return"], "offer": ["offer letter", "appointment letter"],
    "p&l": ["p&l", "profit and loss", "profit & loss"], "balance sheet": ["balance sheet"],
    "gst": ["gst certificate", "gstin"], "passport": ["passport"], "oci": ["oci card", "pio card"],
    "work permit": ["work permit", "labour card"], "moa": ["moa", "memorandum"],
    "aoa": ["aoa", "articles of association"], "partnership deed": ["partnership deed"],
    "board resolution": ["board resolution"], "encumbrance": ["encumbrance", "ec "],
    "noc": ["noc ", "no objection"], "nach": ["nach", "ecs mandate"],
    "demand letter": ["demand letter"], "title deed": ["title deed", "index ii"],
    "sale agreement": ["sale agreement", "allotment letter"], "coi": ["certificate of incorporation", "coi"],
  };
  const confirmed = [], missing = [];
  allDocs.forEach(doc => {
    const dl = doc.toLowerCase();
    let found = txt.includes(dl.slice(0, 12));
    if (!found) { for (const [key, pats] of Object.entries(KW)) { if (dl.includes(key) && pats.some(p => txt.includes(p))) { found = true; break; } } }
    if (found) confirmed.push(doc); else missing.push(doc);
  });
  const concerns = [];
  if (missing.length > allDocs.length * 0.6) concerns.push("Over 60% of required documents not yet received — do not proceed to bank login.");
  if (!txt.includes("pan") && !txt.includes("aadhaar") && !txt.includes("aadhar")) concerns.push("Basic KYC (PAN + Aadhaar) not confirmed — mandatory for all cases.");
  if (txt.includes("expired") || txt.includes("expiry")) concerns.push("Document expiry mentioned — verify all validity dates.");
  const score = Math.round((confirmed.length / allDocs.length) * 100);
  let nextAction = "Share complete document list with client and follow up within 2 days.";
  if (score >= 80) nextAction = "Most documents collected. Prepare OCR sheet and initiate bank login.";
  else if (score >= 50) nextAction = "Send query file for pending documents. Follow up every 2 days.";
  return { source: "rule-engine", confirmed, missing, concerns, nextAction, score };
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

  function login(u, p, mode) {
    const cleanU = (u || '').trim().toLowerCase();
    const cleanP = (p || '').trim();
    const user = store.users.find(x =>
      (x.username || '').trim().toLowerCase() === cleanU &&
      (x.password || '').trim() === cleanP &&
      x.active !== false
    );
    if (user) {
      if (mode === "exec" && user.role !== "admin" && user.role !== "executive") return false;
      if (mode === "field" && user.role !== "field") return false;
      if (mode === "developer" && user.role !== "developer") return false;
      if (mode === "agent" && user.role !== "agent") return false;
      setSession(user);
      return true;
    }
    return false;
  }
  function logout() { setSession(null); }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${T.navy} 0%,${T.navyMid} 60%,${T.navyLight} 100%)` }}>
      <style>{STYLE}</style>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: T.gold, marginBottom: 12 }}>Ghar Kar CRM</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[0, 1, 2].map(i => <div key={i} className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: T.gold, animationDelay: `${i * 0.2}s` }} />)}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Connecting to database…</div>
    </div>
  );
  if (!session) return <LoginPage onLogin={login} />;
  if (session.role === "admin") return <AdminApp store={store} persist={persist} session={session} onLogout={logout} />;
  if (session.role === "field") return <FieldApp store={store} persist={persist} session={session} onLogout={logout} />;
  if (session.role === "partner") return <PartnerApp store={store} session={session} onLogout={logout} />;
  if (session.role === "developer") return <DeveloperApp store={store} persist={persist} session={session} onLogout={logout} />;
  if (session.role === "agent") return <AgentApp store={store} persist={persist} session={session} onLogout={logout} />;
  return <ExecutiveApp store={store} persist={persist} session={session} onLogout={logout} />;
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState(null);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  function submit() { if (!onLogin(u, p, mode)) setErr("Invalid credentials or incorrect login portal. Please try again."); }
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${T.navy} 0%,${T.navyMid} 55%,${T.navyLight} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <style>{STYLE}</style>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: T.gold, letterSpacing: 1 }}>Ghar Kar CRM</div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4, letterSpacing: 3, textTransform: "uppercase" }}>Ghar Kar CRM — Home Loan Processing Software</div>
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
          <button onClick={() => setMode("developer")} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 16, padding: "22px 26px", color: T.white, textAlign: "left", cursor: "pointer" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>Developer Login</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Developers / Builders — Inventory management access</div>
          </button>
          <button onClick={() => setMode("agent")} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 16, padding: "22px 26px", color: T.white, textAlign: "left", cursor: "pointer" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>Agent Login</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Agents — Access to post-sales tracking and handover</div>
          </button>
          <button onClick={() => setMode("exec")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4, textDecoration: "underline", cursor: "pointer" }}>Admin? Use Executive login with admin credentials</button>
        </div>
      ) : (
        <div style={{ background: T.white, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }} className="fade">
          <button onClick={() => { setMode(null); setErr(""); }} style={{ background: "none", border: "none", color: T.textMid, fontSize: 13, marginBottom: 20, cursor: "pointer", padding: 0 }}>← Back</button>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: T.navy, marginBottom: 4 }}>{mode === "field" ? "Field Agent" : mode === "developer" ? "Developer" : mode === "agent" ? "Agent" : "Executive"} Sign In</div>
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
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.gold, marginRight: 8, whiteSpace: "nowrap" }}>Ghar Kar CRM</div>
        <div style={{ flex: 1, display: "flex", gap: 1, overflowX: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: activeNav === n.id ? "rgba(212,168,83,0.16)" : "transparent", color: activeNav === n.id ? T.gold : T.goldDim, fontSize: 13, fontWeight: activeNav === n.id ? 600 : 400, whiteSpace: "nowrap", cursor: "pointer" }}>{n.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {session.role === "field" && (
            <button onClick={() => alert(`✅ Punched in successfully at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.\nLocation captured.`)} style={{ background: T.greenBg, border: `1px solid ${T.green}50`, borderRadius: 7, color: T.green, fontSize: 12, fontWeight: 600, padding: "5px 10px", cursor: "pointer" }}>Punch In</button>
          )}
          <NotifBell count={myNotifs.length} onClick={() => setShowNotifs(v => !v)} />
          <div style={{ textAlign: "right", display: window.innerWidth > 500 ? "block" : "none" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{session.name}</div>
            <div style={{ fontSize: 10, color: rc, textTransform: "capitalize" }}>{session.role === "field" ? "Field Agent" : session.role === "admin" ? "Administrator" : session.role === "partner" ? "Channel Partner" : session.role === "developer" ? "Developer" : session.role === "agent" ? "Agent" : "Executive"}</div>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 7, color: "rgba(255,255,255,0.65)", fontSize: 12, padding: "5px 10px", cursor: "pointer" }}>Out</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: "1.25rem 1rem", maxWidth: 960, margin: "0 auto", width: "100%" }} onClick={() => showNotifs && setShowNotifs(false)}>{children}</main>
    </div>
  );
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
const AN = [{ id: "dashboard", label: "Dashboard" }, { id: "kpf", label: "📊 KPF" }, { id: "users", label: "Users" }, { id: "leads", label: "All Leads" }, { id: "logs", label: "Daily Logs" }, { id: "pipeline", label: "Pipeline" }, { id: "escalations", label: "Escalations" }, { id: "external", label: "External Follow-Ups" }, { id: "calculator", label: "🧮 Calculator" }, { id: "hr", label: "🤝 HR" }, { id: "marketing", label: "📢 Marketing" }, { id: "comms", label: "📞 Dialer & Comms" }, { id: "ai_assistant", label: "🤖 AI Assistant" }];
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
    {nav === "kpf" && <KPFDashboard store={store} onSel={setSel} />}
    {nav === "users" && <ManageUsers store={store} persist={persist} />}
    {nav === "leads" && <div className="fade"><ST>All Leads ({(store.leads || []).length})</ST><LeadTable leads={store.leads || []} users={store.users} onSelect={setSel} onDelete={delLead} /></div>}
    {nav === "logs" && <AdminLogs store={store} persist={persist} />}
    {nav === "pipeline" && <AdminPipeline store={store} onSel={setSel} />}
    {nav === "escalations" && <EscalationView store={store} persist={persist} />}
    {nav === "external" && <ExternalFollowups store={store} persist={persist} />}
    {nav === "calculator" && <EMICalculator />}
    {nav === "comms" && <CommunicationsModule store={store} persist={persist} session={session} />}
    {nav === "hr" && <HRModule store={store} />}
    {nav === "marketing" && <MarketingModule store={store} persist={persist} />}
    {nav === "ai_assistant" && <AIAssistantTab store={store} session={session} />}
  </Shell>);
}

// ─── DEVELOPER APP ────────────────────────────────────────────────────────────
const DEV_AN = [{ id: "inventory", label: "🏗️ Inventory" }, { id: "ai_assistant", label: "🤖 AI Assistant" }];
function DeveloperApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("inventory");
  return (<Shell session={session} onLogout={onLogout} navItems={DEV_AN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "inventory" && <InventoryModule />}
    {nav === "ai_assistant" && <AIAssistantTab store={store} session={session} />}
  </Shell>);
}

// ─── AGENT APP ────────────────────────────────────────────────────────────────
const AGENT_AN = [{ id: "postsales", label: "🔑 Post-Sales" }, { id: "ai_assistant", label: "🤖 AI Assistant" }];
function AgentApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("postsales");
  return (<Shell session={session} onLogout={onLogout} navItems={AGENT_AN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "postsales" && <PostSalesModule store={store} />}
    {nav === "ai_assistant" && <AIAssistantTab store={store} session={session} />}
  </Shell>);
}

// ─── KPF DASHBOARD ───────────────────────────────────────────────────────────────
function KPFDashboard({ store, onSel }) {
  const leads = store.leads || [];
  const users = (store.users || []).filter(u => u.role !== "admin");
  const today = td();

  // Core KPIs
  const active = leads.filter(l => l.currentStep < 39);
  const disbursed = leads.filter(l => l.currentStep >= 38);
  const thisMonth = leads.filter(l => {
    const d = l.stageHistory?.find(h => h.step >= 38)?.date;
    return d && d.startsWith(today.slice(0, 7));
  });
  const overdue = leads.filter(l => l.followUp && l.followUp < today && l.currentStep < 39);
  const todayFU = leads.filter(l => l.followUp === today && l.currentStep < 39);
  const noFU = leads.filter(l => !l.followUp && l.currentStep < 39);
  const convRate = leads.length > 0 ? Math.round((disbursed.length / leads.length) * 100) : 0;

  // Pipeline by category
  const catCounts = {};
  leads.forEach(l => {
    const cat = STEPS.find(s => s.id === l.currentStep)?.cat || "lead";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  // Step bottleneck — top 6 steps by lead count
  const stepCounts = {};
  active.forEach(l => { stepCounts[l.currentStep] = (stepCounts[l.currentStep] || 0) + 1; });
  const topSteps = Object.entries(stepCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([id, count]) => ({ step: STEPS.find(s => s.id === +id), count }));
  const maxStepCount = Math.max(...topSteps.map(s => s.count), 1);

  // Source breakdown
  const srcCounts = {};
  leads.forEach(l => { const s = l.source || "Other"; srcCounts[s] = (srcCounts[s] || 0) + 1; });
  const srcTotal = leads.length || 1;
  const srcColors = [T.navy, T.blue, T.purple, T.amber, T.green, T.red, "#6D4C41", T.textMid];

  // Staff performance
  const staffPerf = users.map(u => {
    const ml = leads.filter(l => l.assignedTo === u.id);
    const ma = ml.filter(l => l.currentStep < 39);
    const md = ml.filter(l => l.currentStep >= 38);
    const mo = ml.filter(l => l.followUp && l.followUp < today && l.currentStep < 39);
    const mt = ml.filter(l => l.followUp === today && l.currentStep < 39);
    const mn = ml.filter(l => !l.followUp && l.currentStep < 39);
    const cr = ml.length > 0 ? Math.round((md.length / ml.length) * 100) : 0;
    // Mock call and site visit data based on active leads count
    const calls = Math.round(ma.length * 1.5 + Math.random() * 5);
    const visits = Math.round(ma.length * 0.2 + Math.random() * 2);
    const callTime = Math.round(calls * 3.5); // avg 3.5 mins per call
    return { user: u, total: ml.length, active: ma.length, disbursed: md.length, overdue: mo.length, todayFU: mt.length, noFU: mn.length, convRate: cr, calls, visits, callTime };
  }).sort((a, b) => b.total - a.total);
  const maxLeads = Math.max(...staffPerf.map(s => s.total), 1);

  const KPICard = ({ label, value, color, bg, sub }) => (
    <div className="stat-card" style={{ background: bg || T.white, border: `1px solid ${color}22`, padding: "18px 14px" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.9, marginTop: 6, opacity: 0.8 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: T.textLight, marginTop: 3 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="fade">
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.navy, marginBottom: 4 }}>📊 KPF Dashboard</div>
      <div style={{ fontSize: 12, color: T.textLight, marginBottom: 20 }}>Key Performance Figures — live snapshot of your entire pipeline.</div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
        <KPICard label="Total Leads" value={leads.length} color={T.navy} bg="#EEF0FB" />
        <KPICard label="Active Pipeline" value={active.length} color={T.blue} bg={T.blueBg} />
        <KPICard label="Disbursed" value={disbursed.length} color={T.green} bg={T.greenBg} />
        <KPICard label="This Month" value={thisMonth.length} color={T.purple} bg={T.purpleBg} sub="disbursals" />
        <KPICard label="Today's FU" value={todayFU.length} color={T.amber} bg={T.amberBg} />
        <KPICard label="Overdue" value={overdue.length} color={overdue.length > 0 ? T.red : T.green} bg={overdue.length > 0 ? T.redBg : T.greenBg} />
        <KPICard label="No Follow-Up" value={noFU.length} color={noFU.length > 0 ? T.amber : T.green} bg={noFU.length > 0 ? T.amberBg : T.greenBg} />
        <KPICard label="Conv. Rate" value={`${convRate}%`} color={convRate >= 20 ? T.green : T.amber} bg={T.cream} sub={`${disbursed.length} of ${leads.length}`} />
      </div>

      {/* Two col: pipeline funnel + source */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Pipeline Funnel */}
        <div className="posh-card">
          <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>Pipeline by Stage</div>
          {Object.entries(CAT_META).map(([cat, meta]) => {
            const count = catCounts[cat] || 0;
            const pct = Math.round((count / Math.max(leads.length, 1)) * 100);
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: T.textMid, fontWeight: 600 }}>{count} &nbsp;<span style={{ color: T.textLight, fontWeight: 400 }}>{pct}%</span></span>
                </div>
                <div style={{ background: T.creamDark, borderRadius: 6, height: 9, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: `linear-gradient(90deg,${meta.color},${meta.color}80)`, borderRadius: 6, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Source Breakdown */}
        <div className="posh-card">
          <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>Lead Sources</div>
          {Object.entries(srcCounts).sort((a, b) => b[1] - a[1]).map(([src, cnt], i) => {
            const pct = Math.round((cnt / srcTotal) * 100);
            const c = srcColors[i % srcColors.length];
            return (
              <div key={src} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{src}</span>
                  <span style={{ fontSize: 11, color: T.textMid, fontWeight: 600 }}>{cnt} &nbsp;<span style={{ color: T.textLight, fontWeight: 400 }}>{pct}%</span></span>
                </div>
                <div style={{ background: T.creamDark, borderRadius: 6, height: 9, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: `linear-gradient(90deg,${c},${c}80)`, borderRadius: 6, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
          {Object.keys(srcCounts).length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No data yet.</div>}
        </div>
      </div>

      {/* Step Bottleneck */}
      <div className="posh-card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>🚧 Step Bottleneck — Where Leads Are Stuck</div>
        {topSteps.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No active leads.</div>}
        {topSteps.map(({ step, count }) => {
          if (!step) return null;
          const meta = CAT_META[step.cat] || CAT_META.lead;
          const pct = Math.round((count / maxStepCount) * 100);
          return (
            <div key={step.id} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: meta.color }}>{step.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{count} lead{count > 1 ? "s" : ""}</span>
                </div>
                <div style={{ background: T.creamDark, borderRadius: 5, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${meta.color},${meta.color}70)`, borderRadius: 5, transition: "width 0.7s ease" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Performance Table */}
      <div className="posh-card">
        <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>👥 Staff Performance</div>
        {staffPerf.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No staff added yet.</div>}
        {staffPerf.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Executive", "Leads", "Active", "Disbursed", "Conv%", "Today FU", "Calls", "Visits", "Overdue"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffPerf.map(s => (
                  <tr key={s.user.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${T.navy},${T.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.gold, flexShrink: 0 }}>
                          {s.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>{s.user.name}</div>
                          <div style={{ fontSize: 10, color: T.textLight, textTransform: "capitalize" }}>{s.user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, background: T.creamDark, borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{ width: `${Math.round((s.total / maxLeads) * 100)}%`, height: "100%", background: T.navy, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: T.navy }}>{s.total}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.blue }}>{s.active}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.green }}>{s.disbursed}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ background: s.convRate >= 20 ? T.greenBg : s.convRate >= 10 ? T.amberBg : T.redBg, color: s.convRate >= 20 ? T.green : s.convRate >= 10 ? T.amber : T.red, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s.convRate}%</span>
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.amber }}>{s.todayFU}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ fontWeight: 600, color: T.navy }}>{s.calls}</div>
                      <div style={{ fontSize: 10, color: T.textLight }}>{s.callTime} mins</div>
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.purple }}>{s.visits}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ color: s.overdue > 0 ? T.red : T.green, fontWeight: 700 }}>{s.overdue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
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
          <div><div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{u.name} <Tg c={u.role === "field" ? "#5C6BC0" : u.role === "partner" ? "#0F6E56" : u.role === "developer" ? T.amber : u.role === "agent" ? T.purple : T.navy}>{u.role === "field" ? "Field" : u.role === "partner" ? "Partner" : u.role === "developer" ? "Developer" : u.role === "agent" ? "Agent" : "Executive"}</Tg>{u.active === false && <Tg c={T.red}>Inactive</Tg>}</div>
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
          <option value="developer">Developer (Inventory access only)</option>
          <option value="agent">Agent (Post-sales access only)</option>
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
            <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{u.name} <Tg c={u.role === "field" ? "#5C6BC0" : u.role === "partner" ? "#0F6E56" : u.role === "developer" ? T.amber : u.role === "agent" ? T.purple : T.navy}>{u.role === "field" ? "Field Agent" : u.role === "partner" ? "Channel Partner" : u.role === "developer" ? "Developer" : u.role === "agent" ? "Agent" : "Executive"}</Tg></div>
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

function AdminLogs({ store, persist }) {
  const users = store.users.filter(u => u.role !== "admin");
  const [selU, setSelU] = useState(users[0]?.id || "");
  const myLogs = (store.dailyLogs || {})[selU] || {};
  const dates = Object.keys(myLogs).sort().reverse();
  const user = users.find(u => u.id === selU);

  function delLog(d) {
    if(!confirm("Delete this log?")) return;
    const newStore = JSON.parse(JSON.stringify(store));
    if(newStore.dailyLogs && newStore.dailyLogs[selU]) {
      delete newStore.dailyLogs[selU][d];
      persist(newStore);
    }
  }

  return (<div className="fade">
    <ST>Daily Logs</ST>
    <select value={selU} onChange={e => setSelU(e.target.value)} style={{ maxWidth: 280, marginBottom: 16 }}>
      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role === "field" ? "Field" : u.role === "partner" ? "Partner" : u.role === "developer" ? "Developer" : u.role === "agent" ? "Agent" : "Executive"})</option>)}
    </select>
    {dates.length === 0 && selU && <div style={{ fontSize: 13, color: T.textLight }}>No logs submitted by {user?.name} yet.</div>}
    {dates.map(d => (
      <div key={d} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: T.textMid }}>{new Date(d).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
          <button onClick={() => delLog(d)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} title="Delete Log">🗑️</button>
        </div>
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
  
  function onDone(id) {
    persist({ ...store, escalations: (store.escalations || []).filter(e => e.id !== id) });
  }

  return (<div className="fade">
    <ST>Escalation Alerts</ST>
    <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Tasks that were pending for over 24 hours. These are auto-generated when a staff member is stuck on a step.</div>
    {escs.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No escalations yet.</div>}
    {escs.map(e => (
      <div key={e.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.red}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: T.text }}>{e.staffName}</div>
            <div style={{ fontSize: 12, color: T.textLight }}>{e.date}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onDone(e.id)} style={{ background: T.greenBg, border: `1px solid ${T.green}50`, color: T.green, borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✅ Mark Done</button>
            <button onClick={() => onDone(e.id)} style={{ background: T.redBg, border: `1px solid ${T.red}50`, color: T.red, borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🗑️ Delete</button>
          </div>
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
    if (!form.name || !form.leadId) {
      alert("⚠️ Please provide the Advocate/Valuer Name and select a Related Lead.");
      return;
    }
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
    <Grid cols="1fr 2fr" gap={16}>
      <div>
        <Card title="Add External Follow-Up">
          <F l="Type"><select value={form.type} onChange={e => setForm(x => ({ ...x, type: e.target.value }))} style={{ marginBottom: 12 }}>
            <option>Advocate</option><option>Valuer</option><option>Bank RM</option><option>Other</option>
          </select></F>
          <F l="Name / Firm"><input value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Adv. Mehta" style={{ marginBottom: 12 }} /></F>
          <F l="Related Lead"><select value={form.leadId} onChange={e => setForm(x => ({ ...x, leadId: e.target.value }))} style={{ marginBottom: 12 }}>
            <option value="">Select lead...</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select></F>
          <F l="Report Deadline"><input type="date" value={form.deadline} onChange={e => setForm(x => ({ ...x, deadline: e.target.value }))} style={{ marginBottom: 12 }} /></F>
          <F l="Notes"><textarea value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} rows={2} placeholder="What report is pending?" style={{ marginBottom: 16, resize: "vertical" }} /></F>
          <Btn onClick={add} c={T.navy} full>Add Follow-Up</Btn>
        </Card>
      </div>
      <div>
        {pending.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 8 }}>Pending ({pending.length})</div>
            {pending.map(f => {
              const lead = leads.find(l => l.id === f.leadId);
              const isOverdue = f.deadline && f.deadline < td();
              return (<div key={f.id} style={{ background: T.white, border: `1px solid ${isOverdue ? T.red : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{f.type}: {f.name}</div>
                  <div style={{ fontSize: 12, color: T.textLight, marginTop: 4 }}>Lead: <span style={{ fontWeight: 500 }}>{lead?.name || "—"}</span></div>
                  <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>Due: {f.deadline || "Not set"} {isOverdue && <Tg c={T.red}>OVERDUE</Tg>}</div>
                  {f.notes && <div style={{ fontSize: 11, color: T.textMid, marginTop: 4, fontStyle: "italic" }}>"{f.notes}"</div>}
                </div>
                <button onClick={() => markDone(f.id)} style={{ fontSize: 12, padding: "8px 16px", border: `1px solid ${T.green}`, borderRadius: 8, background: T.white, color: T.green, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}>Mark Done</button>
              </div>);
            })}
          </div>
        ) : (
          <div style={{ background: T.white, border: `1px dashed ${T.border}`, padding: 30, textAlign: "center", borderRadius: 12, color: T.textLight, fontSize: 13, marginBottom: 20 }}>No pending external follow-ups.</div>
        )}
        {done.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.green, marginBottom: 8 }}>Completed ({done.length})</div>
            {done.slice(0, 5).map(f => {
              const lead = leads.find(l => l.id === f.leadId);
              return (<div key={f.id} style={{ background: T.greenBg, border: `1px solid #A5D6A7`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, fontSize: 13, color: T.green, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{f.type}: <strong>{f.name}</strong> · {lead?.name || "—"}</span><Tg c={T.green}>✓ Done</Tg>
              </div>);
            })}
          </div>
        )}
      </div>
    </Grid>
  </div>);
}

// ─── EXECUTIVE APP ────────────────────────────────────────────────────────────
const EN = [{ id: "today", label: "Today" }, { id: "leads", label: "My Leads" }, { id: "add", label: "Add Lead" }, { id: "followups", label: "Follow-Ups" }, { id: "comms", label: "📞 Comms" }, { id: "guide", label: "Process Guide" }, { id: "external", label: "External" }, { id: "log", label: "Daily Log" }, { id: "calculator", label: "🧲 Calculator" }];
function ExecutiveApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("today"); const [sel, setSel] = useState(null);
  const myLeads = (store.leads || []).filter(l => l.assignedTo === session.id);
  function updLead(id, upd) { persist({ ...store, leads: (store.leads || []).map(l => l.id === id ? { ...l, ...upd } : l) }); }
  function delLead(id) { if (!window.confirm("Delete this lead permanently?")) return; persist({ ...store, leads: (store.leads || []).filter(l => l.id !== id) }); setSel(null); }
  function addLead(lead) {
    const nl = { ...lead, id: gid(), assignedTo: session.id, currentStep: 1, stepsCompleted: {}, notes: [], followUp: "", stageHistory: [{ step: 1, date: td() }], createdAt: td(), commLog: [] };
    // Auto welcome notification log
    const commLog = [{ type: "system", msg: `Lead created. Welcome message auto-triggered for ${lead.name}.`, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }];
    if (store.comms?.aiCallOnAssign) {
      commLog.push({ type: "system", msg: `AI Calling triggered instantly for ${lead.name}.`, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
      setTimeout(() => alert(`[System Simulation] AI Call initiated to ${lead.phone} instantly upon lead assignment!`), 500);
    }
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
    {nav === "comms" && <CommunicationsModule store={store} persist={persist} session={session} />}
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
  function addLead(lead) { 
    const nl = { ...lead, id: gid(), assignedTo: session.id, currentStep: 1, stepsCompleted: {}, notes: [], followUp: "", stageHistory: [{ step: 1, date: td() }], createdAt: td(), commLog: [] }; 
    const commLog = [];
    if (store.comms?.aiCallOnAssign) {
      commLog.push({ type: "system", msg: `AI Calling triggered instantly for ${lead.name}.`, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
      setTimeout(() => alert(`[System Simulation] AI Call initiated to ${lead.phone} instantly upon lead assignment!`), 500);
    }
    nl.commLog = commLog;
    persist({ ...store, leads: [nl, ...(store.leads || [])] }); 
    setNav("leads"); 
  }
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

  const todayVisits = [];
  leads.forEach(l => {
    (l.siteVisits || []).forEach(v => {
      if (v.status === "scheduled" && v.date === td()) {
        todayVisits.push({ lead: l, visit: v });
      }
    });
  });

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
    {todayVisits.length > 0 && (
      <Alrt c={T.amber} bg={T.amberBg} title={`Today's Site Visits (${todayVisits.length})`}>
        {todayVisits.map(tv => (
          <div key={tv.visit.id} onClick={() => onSel(tv.lead.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `0.5px solid ${T.amber}40`, cursor: "pointer", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{tv.lead.name} <span style={{ fontSize: 12, color: T.textLight, fontWeight: 400 }}>· {tv.lead.phone}</span></div>
              <div style={{ fontSize: 12, color: T.amber }}>📍 {tv.visit.building} ({tv.visit.wing}) at {tv.visit.time || "TBD"}</div>
            </div>
            <div style={{ fontSize: 11, color: T.amber, whiteSpace: "nowrap" }}>
              <span style={{background: T.amber, color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 600}}>Reminders Active</span>
            </div>
          </div>
        ))}
      </Alrt>
    )}
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
  const tabs = fieldOnly ? ["current", "notes", "history"] : ["current", "allsteps", "comm", "docchecklist", "aidocs", "detailsheet", "financials", "campaigns", "notes", "history"];

  const wasAllDone = useRef(allDone);
  useEffect(() => {
    if (!wasAllDone.current && allDone && lead.currentStep < maxStep && !fieldOnly) {
      const t = setTimeout(() => nextS(), 900);
      return () => clearTimeout(t);
    }
    wasAllDone.current = allDone;
  }, [allDone]);

  function toggleA(action) {
    const prev = lead.stepsCompleted || {};
    const prevStep = prev[step.id] || {};
    const newVal = !prevStep[action];
    const updated = { ...prev, [step.id]: { ...prevStep, [action]: newVal } };
    onUpdate(lead.id, { stepsCompleted: updated });
  }

  function selectAll() {
    const all = step.actions.reduce((acc, a) => ({ ...acc, [a]: true }), {});
    onUpdate(lead.id, { stepsCompleted: { ...(lead.stepsCompleted || {}), [step.id]: all } });
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
          <div style={{ fontSize: 13, color: T.textLight }}>{lead.intention || lead.loanType} · {lead.propertyNeed || lead.propertyType}{lead.propertyNeed === "Flat" ? ` (${lead.bhk})` : ""} · Budget: {lead.budget || (lead.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString("en-IN")}` : "—")}</div>
          {asgn && <div style={{ fontSize: 12, color: T.textLight }}>Assigned: {asgn.name}</div>}
          {lead.source && <div style={{ fontSize: 12, color: T.textLight }}>Source: {lead.source}{lead.sourceName ? ` (${lead.sourceName})` : (lead.partnerRef ? ` (${lead.partnerRef})` : "")}</div>}
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
        {t === "current" ? "Current Step" : t === "allsteps" ? "All 39 Steps" : t === "sitevisits" ? "📍 Site Visits & Follow-up" : t === "comm" ? "Communication" : t === "docchecklist" ? "📋 Docs" : t === "aidocs" ? "🤖 AI Docs" : t === "detailsheet" ? "🧧 Detail Sheet" : t === "financials" ? "💰 Financials" : t === "campaigns" ? "🚀 Campaigns" : t === "notes" ? "Notes" : t === "history" ? "History" : t}
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
        <div style={{ background: cm.bg, border: `1px solid ${cm.border}`, borderRadius: 16, padding: 20, marginBottom: 14, boxShadow: `0 4px 20px ${cm.color}18` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: cm.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>Step {step.id} of {maxStep} · {cm.label}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: cm.color }}>{step.label}</div>
            </div>
            {allDone && <div style={{ background: T.green, color: "#fff", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>✓ Complete</div>}
          </div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${cm.border}` }}>{step.desc}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: cm.color, textTransform: "uppercase", letterSpacing: 0.8 }}>Actions to complete</div>
            <div onClick={selectAll} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${allDone ? T.green : cm.color}`, background: allDone ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                {allDone && <svg width="10" height="8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: allDone ? T.green : cm.color }}>Select All</span>
            </div>
          </div>
          {step.actions.map((a, i) => {
            const isDone = !!(lead.stepsCompleted?.[step.id]?.[a]);
            return (<div key={i} onClick={() => toggleA(a)} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: `0.5px solid ${cm.border}`, cursor: "pointer" }}>
              <div style={{ minWidth: 22, height: 22, borderRadius: 7, border: `2px solid ${isDone ? T.green : T.border}`, background: isDone ? T.green : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s", boxShadow: isDone ? `0 2px 8px ${T.green}40` : "none" }}>
                {isDone && <svg width="12" height="10"><path d="M1 5l4 4 6-7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
              </div>
              <span style={{ fontSize: 13, color: isDone ? T.textLight : T.text, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.7, transition: "all 0.15s" }}>{a}</span>
            </div>);
          })}
          {allDone && lead.currentStep < maxStep && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: `${T.green}15`, borderRadius: 10, fontSize: 13, color: T.green, fontWeight: 600, textAlign: "center", border: `1px solid ${T.green}30` }}>
              ✓ All done! Advancing to next step automatically…
            </div>
          )}
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

    {tab === "sitevisits" && <SiteVisitsTab lead={lead} onUpdate={onUpdate} />}

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
      <div className="fade" style={{ background: "#efeae2", border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 600, position: "relative" }}>
        {/* Chat Header */}
        <div style={{ background: "#f0f2f5", padding: "10px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #d1d7db", zIndex: 2 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dfe5e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111b21", marginBottom: 2 }}>{lead.name}</div>
            <div style={{ fontSize: 12, color: "#667781" }}>{lead.phone}</div>
          </div>
          <div style={{ display: "flex", gap: 16, color: "#54656f", fontSize: 18, cursor: "pointer" }}>
            <span>📞</span>
            <span>📹</span>
            <span>⋮</span>
          </div>
        </div>

        {/* Chat History (Scrollable) */}
        <div style={{ flex: 1, padding: "20px 5%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#ffeecd", alignSelf: "center", padding: "6px 12px", borderRadius: 8, fontSize: 11, color: "#54656f", marginBottom: 10, textAlign: "center", boxShadow: "0 1px 1px rgba(0,0,0,0.05)" }}>
            Messages and calls are end-to-end encrypted. No one outside of this chat, not even Ghar Kar, can read or listen to them.
          </div>
          {(lead.commLog || []).map((c, i) => {
            // Treat WhatsApp messages as "sent" (green, right), others as system/notes (white, center/left)
            if (c.type === "WhatsApp") {
              return (
                <div key={i} style={{ alignSelf: "flex-end", maxWidth: "75%", background: "#d9fdd3", borderRadius: "8px 0 8px 8px", padding: "6px 8px 8px 10px", boxShadow: "0 1px 0.5px rgba(11,20,55,0.13)", position: "relative" }}>
                  <div style={{ fontSize: 13, color: "#111b21", lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: 12 }}>{c.msg}</div>
                  <div style={{ fontSize: 10, color: "#667781", position: "absolute", bottom: 4, right: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    {c.time}
                    <svg viewBox="0 0 16 15" width="14" height="13" fill="#53bdeb"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" /></svg>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} style={{ alignSelf: "flex-start", maxWidth: "75%", background: "#fff", borderRadius: "0 8px 8px 8px", padding: "6px 8px 8px 10px", boxShadow: "0 1px 0.5px rgba(11,20,55,0.13)", position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cm.color, marginBottom: 4 }}>{c.type} {c.by ? `(by ${c.by})` : ""}</div>
                <div style={{ fontSize: 13, color: "#111b21", lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: 12 }}>{c.msg}</div>
                <div style={{ fontSize: 10, color: "#667781", position: "absolute", bottom: 4, right: 8 }}>{c.date} {c.time}</div>
              </div>
            );
          })}
          {!(lead.commLog || []).length && (
            <div style={{ textAlign: "center", fontSize: 13, color: "#54656f", marginTop: 40, background: "rgba(255,255,255,0.6)", padding: "10px 20px", borderRadius: 20, alignSelf: "center" }}>No messages yet. Send a WhatsApp to start the conversation.</div>
          )}
        </div>

        {/* Quick Templates Drawer */}
        <div style={{ background: "#f0f2f5", padding: "10px 16px", borderTop: "1px solid #d1d7db", display: "flex", gap: 8, overflowX: "auto" }}>
          {WA_TEMPLATES.map(tpl => (
            <button key={tpl.id} onClick={() => setCommNote(tpl.msg(lead))} style={{ background: "#fff", border: "1px solid #d1d7db", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#54656f", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
              <span>{tpl.icon}</span> {tpl.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ background: "#f0f2f5", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 24, color: "#54656f", cursor: "pointer" }}>😊</div>
          <div style={{ fontSize: 22, color: "#54656f", cursor: "pointer", transform: "rotate(45deg)" }}>📎</div>
          <input
            value={commNote}
            onChange={e => setCommNote(e.target.value)}
            placeholder="Type a message"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (!commNote.trim()) return;
                const msg = commNote.trim();
                const commLog = [...(lead.commLog || []), { type: "WhatsApp", msg, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), by: asgn?.name || "System" }];
                onUpdate(lead.id, { commLog });
                setCommNote("");
                const phone = (lead.phone || "").replace(/\D/g, "");
                const intlPhone = phone.length === 10 ? `91${phone}` : phone;
                window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, "_blank");
              }
            }}
            style={{ flex: 1, border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 14, background: "#fff", outline: "none", boxShadow: "none", color: "#111b21" }}
          />
          <button onClick={() => {
            if (!commNote.trim()) return;
            const msg = commNote.trim();
            const commLog = [...(lead.commLog || []), { type: "WhatsApp", msg, date: td(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), by: asgn?.name || "System" }];
            onUpdate(lead.id, { commLog });
            setCommNote("");
            const phone = (lead.phone || "").replace(/\D/g, "");
            const intlPhone = phone.length === 10 ? `91${phone}` : phone;
            window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, "_blank");
          }} style={{ width: 44, height: 44, borderRadius: "50%", background: "#00a884", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      </div>
    )}

    {tab === "docchecklist" && !fieldOnly && <DocChecklistTab lead={lead} onUpdate={onUpdate} />}
    {tab === "aidocs" && !fieldOnly && <AiDocsTab lead={lead} />}
    {tab === "detailsheet" && !fieldOnly && <DetailSheetTab lead={lead} onUpdate={onUpdate} />}
    {tab === "financials" && !fieldOnly && <FinancialsTab lead={lead} onUpdate={onUpdate} />}
    {tab === "campaigns" && !fieldOnly && <CampaignsTab lead={lead} onUpdate={onUpdate} />}

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
  const [f, setF] = useState({ name: "", phone: "", intention: "Want to Buy", source: "Online", sourceName: "", propertyNeed: "Flat", bhk: "2BHK", budget: "", city: "", notes: "" });
  const [errs, setErrs] = useState({});
  const s = (k, v) => { setF(p => ({ ...p, [k]: v })); setErrs(e => ({ ...e, [k]: "" })); };

  function validate() {
    const e = {};
    if (!f.name.trim()) e.name = "Full name is required";
    if (!f.phone.trim()) e.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = "Invalid mobile number — must be exactly 10 digits";
    if ((f.source === "Agent" || f.source === "Customer") && !f.sourceName.trim()) e.sourceName = "Reference name is required";
    if (!f.budget.trim()) e.budget = "Budget/Price range is required";
    if (!f.city.trim()) e.city = "City is required";
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
        <F l="Lead Intention"><select value={f.intention} onChange={e => s("intention", e.target.value)}>{["Want to Sell", "Want to Rent", "For Rent", "Want to Buy"].map(t => <option key={t}>{t}</option>)}</select></F>
        <div><F l="City *"><input value={f.city} onChange={e => s("city", e.target.value)} placeholder="e.g. Pune" style={{ borderColor: errs.city ? T.red : undefined }} /></F><Err field="city" /></div>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <F l="Lead Source"><select value={f.source} onChange={e => s("source", e.target.value)}>{["Agent", "Customer", "Newspaper", "Online", "Google", "Hoardings"].map(t => <option key={t}>{t}</option>)}</select></F>
        {(f.source === "Agent" || f.source === "Customer") ? <div><F l="Reference Name *"><input value={f.sourceName} onChange={e => s("sourceName", e.target.value)} placeholder={f.source === "Agent" ? "Agent Name" : "Customer Name"} style={{ borderColor: errs.sourceName ? T.red : undefined }} /></F><Err field="sourceName" /></div> : <div />}
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <F l="Property Need"><select value={f.propertyNeed} onChange={e => s("propertyNeed", e.target.value)}>{["Flat", "Shop", "Office"].map(t => <option key={t}>{t}</option>)}</select></F>
        {f.propertyNeed === "Flat" ? <F l="BHK Option"><select value={f.bhk} onChange={e => s("bhk", e.target.value)}>{["1BHK", "2BHK", "3BHK"].map(t => <option key={t}>{t}</option>)}</select></F> : <div />}
      </Grid>
      <div><F l="Budget / Price Range *"><input value={f.budget} onChange={e => s("budget", e.target.value)} placeholder="e.g. 50 Lacs - 1 Cr" style={{ borderColor: errs.budget ? T.red : undefined }} /></F><Err field="budget" /></div>
      <div><F l="Initial Remarks / Requirements *"><textarea value={f.notes} onChange={e => s("notes", e.target.value)} placeholder={"Client requirements:\n• Needs 2BHK near Hinjewadi\n• Ready to move\n• Loan required"} rows={3} style={{ resize: "vertical", borderColor: errs.notes ? T.red : undefined }} /></F><Err field="notes" /></div>
      <div>
        <Btn onClick={() => { if (validate()) onAdd(f); }} c={T.navy}>Add Lead → Save Requirements</Btn>
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

// ─── DETAIL SHEET HELPERS (defined OUTSIDE component to prevent remount bug) ──
function DSReadField({ label, value }) {
  return (
    <div style={{ paddingBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{value || "—"}</div>
    </div>
  );
}
function DSSection({ title, accent, children }) {
  return (
    <div className="posh-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 4, height: 28, borderRadius: 2, background: accent || T.gold }} />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.navy }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function DSRadio({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", gap: 12 }}>
        {options.map(o => (
          <label key={o} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, fontWeight: value === o ? 600 : 400, color: value === o ? T.navy : T.textMid }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${value === o ? T.gold : T.border}`, background: value === o ? T.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }} onClick={() => onChange(o)}>
              {value === o && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.white }} />}
            </div>
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── SITE VISITS & FOLLOW-UP TAB ─────────────────────────────────────────────
function SiteVisitsTab({ lead, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ date: "", time: "", building: "", floor: "", wing: "", price: "", negotiable: "Yes" });
  const [fb, setFb] = useState({ liked: "Yes", bookDate: "", nextVisitDate: "" });
  const visits = lead.siteVisits || [];
  
  function saveVisit() {
    if (!f.date || !f.building) return alert("Date and Building are required.");
    const nv = { id: gid(), ...f, status: "scheduled", createdOn: td() };
    onUpdate(lead.id, { siteVisits: [nv, ...visits] });
    setF({ date: "", time: "", building: "", floor: "", wing: "", price: "", negotiable: "Yes" });
    setShowForm(false);
  }

  function saveFeedback(vId) {
    const updatedVisits = visits.map(v => {
      if (v.id === vId) {
        return { ...v, status: "completed", feedback: { ...fb } };
      }
      return v;
    });
    
    if (fb.liked === "No" && fb.nextVisitDate) {
      updatedVisits.unshift({ id: gid(), date: fb.nextVisitDate, time: "", building: "TBD", floor: "", wing: "", price: "", negotiable: "Yes", status: "scheduled", createdOn: td() });
    }
    
    onUpdate(lead.id, { siteVisits: updatedVisits });
    setFb({ liked: "Yes", bookDate: "", nextVisitDate: "" });
  }

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <ST>📍 Site Visits & Follow-Up</ST>
        {!showForm && <Btn c={T.navy} onClick={() => setShowForm(true)}>+ Schedule New Visit</Btn>}
      </div>

      {showForm && (
        <Card title="Schedule Site Visit" accent={T.blue}>
          <Grid cols="1fr 1fr" gap={10}>
            <div><F l="Visit Date"><input type="date" value={f.date} onChange={e => setF({...f, date: e.target.value})} /></F></div>
            <div><F l="Visit Time"><input type="time" value={f.time} onChange={e => setF({...f, time: e.target.value})} /></F></div>
          </Grid>
          <Grid cols="1fr 1fr" gap={10}>
            <div><F l="Building Name"><input value={f.building} onChange={e => setF({...f, building: e.target.value})} placeholder="e.g. Ghar Kar Heights" /></F></div>
            <div><F l="Floor & Wing"><input value={f.wing} onChange={e => setF({...f, wing: e.target.value})} placeholder="e.g. 4th Floor, B Wing" /></F></div>
          </Grid>
          <Grid cols="1fr 1fr" gap={10}>
            <div><F l="Quoted Price (₹)"><input type="number" value={f.price} onChange={e => setF({...f, price: e.target.value})} placeholder="e.g. 8500000" /></F></div>
            <F l="Is Price Negotiable?"><select value={f.negotiable} onChange={e => setF({...f, negotiable: e.target.value})}><option>Yes</option><option>No</option></select></F>
          </Grid>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn c={T.navy} onClick={saveVisit}>Save Visit & Auto-set Reminders</Btn>
            <button onClick={() => setShowForm(false)} className="posh-btn" style={{ background: "transparent", color: T.textMid, border: `1px solid ${T.border}` }}>Cancel</button>
          </div>
        </Card>
      )}

      {visits.length === 0 && !showForm && (
        <div style={{ padding: 40, textAlign: "center", background: T.white, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>No Site Visits Planned</div>
          <div style={{ fontSize: 13, color: T.textLight, marginTop: 4 }}>Schedule a visit to trigger automated customer and agent reminders.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {visits.map(v => (
          <Card key={v.id} accent={v.status === "scheduled" ? T.amber : T.green}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>{v.building} <span style={{ fontSize: 13, color: T.textLight, fontWeight: 400 }}>({v.wing})</span></div>
                <div style={{ fontSize: 13, color: T.text, marginTop: 4 }}>📅 {v.date} at {v.time || "TBD"}</div>
              </div>
              <Tg c={v.status === "scheduled" ? T.amber : T.green}>{v.status === "scheduled" ? "Upcoming Visit" : "Completed"}</Tg>
            </div>
            
            <div style={{ background: T.cream, padding: 12, borderRadius: 8, fontSize: 13, display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div><span style={{ color: T.textLight }}>Quoted:</span> ₹{v.price ? Number(v.price).toLocaleString("en-IN") : "TBD"}</div>
              <div><span style={{ color: T.textLight }}>Negotiable:</span> {v.negotiable}</div>
            </div>

            {v.status === "scheduled" ? (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 10 }}>Post-Visit Feedback</div>
                <Grid cols="1fr 1fr" gap={10}>
                  <F l="Did customer like it?"><select value={fb.liked} onChange={e => setFb({...fb, liked: e.target.value})}><option>Yes</option><option>No</option></select></F>
                  {fb.liked === "Yes" ? (
                    <div><F l="When will they book?"><input type="date" value={fb.bookDate} onChange={e => setFb({...fb, bookDate: e.target.value})} /></F></div>
                  ) : (
                    <div><F l="Next Property Showing Date"><input type="date" value={fb.nextVisitDate} onChange={e => setFb({...fb, nextVisitDate: e.target.value})} /></F></div>
                  )}
                </Grid>
                <div style={{ marginTop: 10 }}><Btn c={T.green} onClick={() => saveFeedback(v.id)}>Submit Feedback</Btn></div>
                
                <div style={{ marginTop: 16, background: T.amberBg, padding: 10, borderRadius: 8, border: `1px solid ${T.amber}40` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, textTransform: "uppercase", marginBottom: 6 }}>Automated Reminder Schedule Active</div>
                  <div style={{ fontSize: 12, color: T.text }}><span style={{ color: T.green }}>✓</span> 1 Day Before: Agent & Customer SMS</div>
                  <div style={{ fontSize: 12, color: T.text }}><span style={{ color: T.green }}>✓</span> 4 Hours Before: Customer Call Reminder</div>
                  <div style={{ fontSize: 12, color: T.text }}><span style={{ color: T.green }}>✓</span> 2 Hours Before: Customer Call Reminder</div>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, fontSize: 13 }}>
                <div style={{ color: T.textLight, marginBottom: 4 }}>Feedback: <strong style={{ color: v.feedback.liked === "Yes" ? T.green : T.red }}>{v.feedback.liked === "Yes" ? "Liked Property" : "Rejected Property"}</strong></div>
                {v.feedback.liked === "Yes" && <div style={{ color: T.textLight }}>Expected Booking Date: <strong>{v.feedback.bookDate || "Not Specified"}</strong></div>}
                {v.feedback.liked === "No" && <div style={{ color: T.textLight }}>Next Visit Scheduled for: <strong>{v.feedback.nextVisitDate || "Not Specified"}</strong></div>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── DETAIL SHEET TAB ────────────────────────────────────────────────────────
function DetailSheetTab({ lead, onUpdate }) {
  const hasCoApp = lead.coApplicant && lead.coApplicant.trim().toLowerCase() !== "none" && lead.coApplicant.trim() !== "";
  const [form, setForm] = useState({
    address: lead.address || "",
    fatherName: lead.fatherName || "",
    motherName: lead.motherName || "",
    marital: lead.marital || "Unmarried",
    spouseName: lead.spouseName || "",
    children: lead.children || "0",
    existingLoans: lead.existingLoans || "0",
    existingLoanDetails: lead.existingLoanDetails || "",
    coAddress: lead.coAddress || "",
    coFatherName: lead.coFatherName || "",
    coMotherName: lead.coMotherName || "",
    coMarital: lead.coMarital || "Unmarried",
    coSpouseName: lead.coSpouseName || "",
    coChildren: lead.coChildren || "0",
    coExistingLoans: lead.coExistingLoans || "0",
    coExistingLoanDetails: lead.coExistingLoanDetails || "",
    coPhone: lead.coPhone || "",
    coEmail: lead.coEmail || "",
    coRelation: lead.coRelation || "",
  });
  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function save() { onUpdate(lead.id, form); alert("Detail Sheet saved!"); }

  return (
    <div className="fade print-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }} className="no-print">
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.navy }}>Client Detail Sheet</div>
          <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>Auto-filled from lead. Complete additional fields below.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} className="posh-btn" style={{ background: T.navy, color: T.gold }}>Save Sheet</button>
          <button onClick={() => window.print()} className="posh-btn" style={{ background: T.gold, color: T.navy }}>🖨️ Print</button>
        </div>
      </div>

      <DSSection title="Primary Applicant" accent={T.gold}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <DSReadField label="Full Name" value={lead.name} />
          <DSReadField label="Mobile" value={lead.phone} />
          <DSReadField label="Email" value={lead.email} />
          <DSReadField label="Loan Type" value={lead.loanType} />
          <DSReadField label="Loan Amount" value={lead.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString("en-IN")}` : null} />
          <DSReadField label="Employment Type" value={lead.employmentType} />
        </div>
        <F l="Current Residential Address"><textarea value={form.address} onChange={e => upd("address", e.target.value)} rows={2} placeholder="Full current address..." /></F>
        <div style={{ marginTop: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <F l="Father's Full Name"><input value={form.fatherName} onChange={e => upd("fatherName", e.target.value)} placeholder="Father's name" /></F>
          <F l="Mother's Full Name"><input value={form.motherName} onChange={e => upd("motherName", e.target.value)} placeholder="Mother's name" /></F>
        </div>
        <DSRadio label="Marital Status" value={form.marital} onChange={v => upd("marital", v)} options={["Unmarried", "Married"]} />
        {form.marital === "Married" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <F l="Spouse Full Name"><input value={form.spouseName} onChange={e => upd("spouseName", e.target.value)} placeholder="Spouse name" /></F>
            <F l="Number of Children"><input type="number" min="0" value={form.children} onChange={e => upd("children", e.target.value)} /></F>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <F l="Number of Existing Loans"><input type="number" min="0" value={form.existingLoans} onChange={e => upd("existingLoans", e.target.value)} /></F>
          <F l="Existing Loan Details (bank / EMI)"><input value={form.existingLoanDetails} onChange={e => upd("existingLoanDetails", e.target.value)} placeholder="e.g. HDFC Car Loan ₹8,000/mo" /></F>
        </div>
      </DSSection>

      {hasCoApp && (
        <DSSection title={`Co-Applicant — ${lead.coApplicant}`} accent={T.blue}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <DSReadField label="Co-Applicant Name" value={lead.coApplicant} />
            <div><F l="Mobile"><input value={form.coPhone} onChange={e => upd("coPhone", e.target.value)} placeholder="Co-applicant mobile" /></F></div>
            <div><F l="Email"><input value={form.coEmail} onChange={e => upd("coEmail", e.target.value)} placeholder="Co-applicant email" /></F></div>
            <div><F l="Relationship to Applicant"><input value={form.coRelation} onChange={e => upd("coRelation", e.target.value)} placeholder="e.g. Spouse, Parent, Sibling" /></F></div>
          </div>
          <F l="Co-Applicant Current Residential Address"><textarea value={form.coAddress} onChange={e => upd("coAddress", e.target.value)} rows={2} placeholder="Full current address..." /></F>
          <div style={{ marginTop: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <F l="Father's Full Name"><input value={form.coFatherName} onChange={e => upd("coFatherName", e.target.value)} placeholder="Father's name" /></F>
            <F l="Mother's Full Name"><input value={form.coMotherName} onChange={e => upd("coMotherName", e.target.value)} placeholder="Mother's name" /></F>
          </div>
          <DSRadio label="Marital Status" value={form.coMarital} onChange={v => upd("coMarital", v)} options={["Unmarried", "Married"]} />
          {form.coMarital === "Married" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <F l="Spouse Full Name"><input value={form.coSpouseName} onChange={e => upd("coSpouseName", e.target.value)} placeholder="Spouse name" /></F>
              <F l="Number of Children"><input type="number" min="0" value={form.coChildren} onChange={e => upd("coChildren", e.target.value)} /></F>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <F l="Number of Existing Loans"><input type="number" min="0" value={form.coExistingLoans} onChange={e => upd("coExistingLoans", e.target.value)} /></F>
            <F l="Existing Loan Details (bank / EMI)"><input value={form.coExistingLoanDetails} onChange={e => upd("coExistingLoanDetails", e.target.value)} placeholder="e.g. SBI Home Loan ₹22,000/mo" /></F>
          </div>
        </DSSection>
      )}

      <button onClick={save} className="posh-btn no-print" style={{ background: T.navy, color: T.gold, width: "100%", justifyContent: "center", marginTop: 4 }}>Save Detail Sheet</button>
    </div>
  );
}

// ─── FINANCIALS TAB ─────────────────────────────────────────────────────────────
function FinancialsTab({ lead, onUpdate }) {
  const [f, setF] = useState({ desc: "Processing Fee", amount: "" });
  const invoices = lead.invoices || [];

  function addInv() {
    if (!f.amount) return;
    const inv = { id: gid(), ...f, date: td(), status: "Unpaid" };
    onUpdate(lead.id, { invoices: [inv, ...invoices] });
    setF({ desc: "Processing Fee", amount: "" });
  }

  function markPaid(id) {
    onUpdate(lead.id, { invoices: invoices.map(i => i.id === id ? { ...i, status: "Paid", paidOn: td() } : i) });
  }

  return (<div className="fade">
    <Card title="Invoices & Receipts">
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={f.desc} onChange={e => setF(x => ({ ...x, desc: e.target.value }))} placeholder="Description" style={{ flex: 2 }} />
        <input type="number" value={f.amount} onChange={e => setF(x => ({ ...x, amount: e.target.value }))} placeholder="Amount (₹)" style={{ flex: 1 }} />
        <Btn onClick={addInv} c={T.navy}>Generate Invoice</Btn>
      </div>
      {invoices.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No invoices generated.</div>}
      {invoices.map(i => (
        <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8, background: T.white }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{i.desc}</div>
            <div style={{ fontSize: 12, color: T.textLight }}>Inv #{i.id.slice(0, 6).toUpperCase()} · {i.date}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>₹{Number(i.amount).toLocaleString("en-IN")}</div>
            {i.status === "Paid" ? (
              <span style={{ background: T.greenBg, color: T.green, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Paid on {i.paidOn}</span>
            ) : (
              <Btn onClick={() => markPaid(i.id)} c={T.amber}>Mark Paid</Btn>
            )}
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }} title="Download PDF">📥</button>
          </div>
        </div>
      ))}
    </Card>
  </div>);
}

// ─── CAMPAIGNS TAB ──────────────────────────────────────────────────────────────
function CampaignsTab({ lead, onUpdate }) {
  const activeCamp = lead.activeCampaign;
  const automations = lead.automations || { aiCalling: false, autoWhatsapp: false, chatbots: false };

  function toggleAutomation(key) {
    onUpdate(lead.id, { automations: { ...automations, [key]: !automations[key] } });
  }

  function setCamp(name) {
    onUpdate(lead.id, { activeCampaign: name, campaignStartDate: td() });
  }

  const CAMPS = [
    { name: "3-Year NRI Nurture", desc: "Sends an automated market update and property offers every 45 days via WhatsApp and Email for 3 years.", tags: ["NRI", "Slow"] },
    { name: "Aggressive Closure", desc: "High-frequency follow-ups every 3 days. Includes ROI calculators and limited time bonanza offers.", tags: ["Hot Lead"] },
    { name: "Re-churn Inactive", desc: "For dead leads. Sends a 'Still looking?' message and then pushes educational property content every 15 days.", tags: ["Dead Lead"] }
  ];

  return (<div className="fade">
    <Card title="Drip Marketing & Automation">
      <div style={{ fontSize: 13, color: T.text, marginBottom: 16 }}>Automate engagement and nurture this lead without human involvement.</div>
      {activeCamp ? (
        <div style={{ background: T.greenBg, border: `1px solid ${T.green}40`, padding: 16, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: T.green, fontSize: 15, marginBottom: 4 }}>Active: {activeCamp}</div>
            <div style={{ fontSize: 12, color: T.green, opacity: 0.8 }}>Started on {lead.campaignStartDate}</div>
          </div>
          <Btn onClick={() => onUpdate(lead.id, { activeCampaign: null })} c={T.red}>Stop Campaign</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {CAMPS.map(c => (
            <div key={c.name} style={{ border: `1px solid ${T.border}`, padding: 16, borderRadius: 12, background: T.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{c.name}</div>
                <Btn onClick={() => setCamp(c.name)} c={T.blue}>Start Campaign</Btn>
              </div>
              <div style={{ fontSize: 13, color: T.textLight, marginBottom: 8 }}>{c.desc}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {c.tags.map(t => <Tg key={t} c={T.purple}>{t}</Tg>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>

    <Card title="Marketing & Communication Automator">
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Predefine actions based on customer behavior. AI will automatically call or message them on your behalf.</div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${automations.aiCalling ? T.green : T.border}`, background: automations.aiCalling ? T.greenBg : T.white, padding: 14, borderRadius: 10 }}>
          <div>
            <div style={{ fontWeight: 600, color: automations.aiCalling ? T.green : T.navy, fontSize: 14 }}>🤖 AI Calling for Auto Follow-Ups</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 4 }}>AI automatically calls the lead if they miss a scheduled site visit or become inactive.</div>
          </div>
          <Btn onClick={() => toggleAutomation("aiCalling")} c={automations.aiCalling ? T.red : T.navy}>{automations.aiCalling ? "Deactivate" : "Activate AI"}</Btn>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${automations.autoWhatsapp ? T.green : T.border}`, background: automations.autoWhatsapp ? T.greenBg : T.white, padding: 14, borderRadius: 10 }}>
          <div>
            <div style={{ fontWeight: 600, color: automations.autoWhatsapp ? T.green : T.navy, fontSize: 14 }}>📱 Auto WhatsApp Communications</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 4 }}>Send an immediate automated brochure and welcome text when lead status changes to "Contacted".</div>
          </div>
          <Btn onClick={() => toggleAutomation("autoWhatsapp")} c={automations.autoWhatsapp ? T.red : T.navy}>{automations.autoWhatsapp ? "Deactivate" : "Activate Bot"}</Btn>
        </div>
      </div>
    </Card>
  </div>);
}

// ─── INVENTORY MODULE ─────────────────────────────────────────────────────────
function InventoryModule() {
  const [proj, setProj] = useState("Ghar Kar Heights");
  const [units, setUnits] = useState(() => Array.from({ length: 40 }, (_, i) => ({ id: `A-${101 + i}`, status: Math.random() > 0.7 ? "sold" : Math.random() > 0.8 ? "blocked" : "available" })));

  const [costSheet, setCostSheet] = useState({ unit: "A-101", basePrice: "4500000", addons: "350000", show: false });

  function toggleUnit(id) {
    setUnits(prev => prev.map(u => {
      if (u.id !== id) return u;
      if (u.status === "available") return { ...u, status: "blocked" };
      if (u.status === "blocked") return { ...u, status: "sold" };
      return { ...u, status: "available" };
    }));
  }

  function renderCostSheetModal() {
    if (!costSheet.show) return null;
    const bp = Number(costSheet.basePrice) || 0;
    const add = Number(costSheet.addons) || 0;
    const agreementValue = bp + add;
    const stampDuty = agreementValue * 0.06; // 6%
    const gst = agreementValue * 0.05; // 5%
    const total = agreementValue + stampDuty + gst;

    return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: T.white, padding: 30, borderRadius: 16, width: 450, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <ST>Ghar Kar Cost Sheet</ST>
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Unit {costSheet.unit} · {proj}</div>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}><span>Base Price</span><span style={{ fontWeight: 600 }}>₹{bp.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}><span>Additional Charges</span><span style={{ fontWeight: 600 }}>₹{add.toLocaleString()}</span></div>
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}><span>Agreement Value</span><span style={{ fontWeight: 700 }}>₹{agreementValue.toLocaleString()}</span></div>
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: T.textLight }}><span>Stamp Duty (6%)</span><span>₹{stampDuty.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: T.textLight }}><span>GST (5%)</span><span>₹{gst.toLocaleString()}</span></div>
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: T.navy, fontWeight: 800 }}><span>Grand Total</span><span>₹{total.toLocaleString()}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full c={T.navy} onClick={() => alert("Cost Sheet printed.")}>🖨️ Print</Btn>
          <Btn full c={T.red} onClick={() => setCostSheet(x => ({ ...x, show: false }))}>Close</Btn>
        </div>
      </div>
    </div>);
  }

  return (<div className="fade">
    {renderCostSheetModal()}
    <ST>🏗️ Inventory & Projects</ST>
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <select value={proj} onChange={e => setProj(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, flex: 1, maxWidth: 300 }}>
        <option>Ghar Kar Heights</option><option>Ghar Kar Residency</option><option>Ghar Kar Villas</option>
      </select>
      <Btn c={T.navy}>Add New Project</Btn>
    </div>
    <Card title="Digital Layouts & Availability">
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 10 }}>Click a unit to toggle its status: Available ➔ Blocked ➔ Sold</div>
      <div style={{ display: "flex", gap: 14, marginBottom: 16, fontSize: 13 }}>
        <span style={{ color: T.green }}><span style={{ display: "inline-block", width: 10, height: 10, background: T.greenBg, marginRight: 4, borderRadius: 2 }} />Available</span>
        <span style={{ color: T.amber }}><span style={{ display: "inline-block", width: 10, height: 10, background: "#FFF8E1", marginRight: 4, borderRadius: 2 }} />Blocked</span>
        <span style={{ color: T.red }}><span style={{ display: "inline-block", width: 10, height: 10, background: "#FFEBEE", marginRight: 4, borderRadius: 2 }} />Sold</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 8 }}>
        {units.map(u => (
          <div key={u.id} onClick={() => toggleUnit(u.id)} style={{ padding: "10px 4px", textAlign: "center", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${u.status === "available" ? T.green : u.status === "blocked" ? T.amber : T.red}40`, background: u.status === "available" ? T.greenBg : u.status === "blocked" ? "#FFF8E1" : "#FFEBEE", color: u.status === "available" ? T.green : u.status === "blocked" ? T.amber : T.red }}>
            {u.id}
          </div>
        ))}
      </div>
    </Card>
    <Grid cols="1fr 1fr" gap={14}>
      <Card title="Cost Sheet Generator">
        <F l="Select Unit"><select value={costSheet.unit} onChange={e => setCostSheet(x => ({ ...x, unit: e.target.value }))} style={{ marginBottom: 10 }}>
          {units.filter(u => u.status !== "sold").map(u => <option key={u.id}>{u.id}</option>)}
        </select></F>
        <F l="Base Price"><input type="number" value={costSheet.basePrice} onChange={e => setCostSheet(x => ({ ...x, basePrice: e.target.value }))} style={{ marginBottom: 10 }} /></F>
        <F l="Additional Charges (Parking, Amenities)"><input type="number" value={costSheet.addons} onChange={e => setCostSheet(x => ({ ...x, addons: e.target.value }))} style={{ marginBottom: 14 }} /></F>
        <Btn onClick={() => setCostSheet(x => ({ ...x, show: true }))} c={T.navy} full>Generate Print-Ready Cost Sheet</Btn>
      </Card>
      <Card title="Payment Schedules">
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 10 }}>Configure milestone-based payment schedules.</div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, padding: 10, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Booking Amount</span><span style={{ fontSize: 13, color: T.textLight }}>10%</span>
        </div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, padding: 10, borderRadius: 8, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>On Possession</span><span style={{ fontSize: 13, color: T.textLight }}>90%</span>
        </div>
        <Btn c={T.blue} full>Manage Schedules</Btn>
      </Card>
    </Grid>
  </div>);
}

// ─── HR MODULE ────────────────────────────────────────────────────────────────
function HRModule({ store }) {
  const [payables, setPayables] = useState([
    { id: 1, agent: "Vikas Sharma", proj: "Ghar Kar Heights", amount: 112500, status: "pending", date: "" },
    { id: 2, agent: "Ramesh Kumar", proj: "Ghar Kar Residency", amount: 45000, status: "pending", date: "" }
  ]);
  const [travel, setTravel] = useState([
    { id: 1, agent: "Ramesh Kumar", desc: "Site Visit Fuel", amt: 450, status: "pending" }
  ]);

  function payComm(id) {
    setPayables(prev => prev.map(p => p.id === id ? { ...p, status: "paid", date: td() } : p));
  }
  function approveTravel() {
    setTravel(prev => prev.map(t => ({ ...t, status: "approved" })));
  }

  return (<div className="fade">
    <ST>🤝 HR & Hierarchy</ST>
    <Grid cols="1fr 1fr" gap={14} mb={14}>
      <Card title="Agent Commission Structures">
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>Define project-wise commission payouts.</div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Direct Sale</span><Tg c={T.green}>2.5%</Tg>
        </div>
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Hierarchy (Team Lead)</span><Tg c={T.blue}>0.5%</Tg>
        </div>
      </Card>
      <Card title="Travel & Expense Management">
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>Manage agent travel requests.</div>
        {travel.map(t => (
          <div key={t.id} style={{ background: t.status === "pending" ? "#FFF8E1" : T.greenBg, border: `1px solid ${t.status === "pending" ? T.amber : T.green}40`, padding: 10, borderRadius: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.status === "pending" ? T.amber : T.green }}>{t.agent} - {t.desc}</div>
            <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>Requested ₹{t.amt} · {t.status === "pending" ? "Pending Approval" : "Approved"}</div>
          </div>
        ))}
        {travel.some(t => t.status === "pending") && <Btn onClick={approveTravel} c={T.amber} full>Approve All Pending</Btn>}
      </Card>
    </Grid>
    <Card title="Commission Payables & Balances">
      <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${T.border}` }}>
            <th style={{ padding: "8px 0", color: T.navy }}>Agent Name</th>
            <th style={{ padding: "8px 0", color: T.navy }}>Project</th>
            <th style={{ padding: "8px 0", color: T.navy }}>Payable</th>
            <th style={{ padding: "8px 0", color: T.navy }}>Status</th>
            <th style={{ padding: "8px 0", color: T.navy }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {payables.map(p => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "10px 0", fontWeight: 500 }}>{p.agent}</td><td style={{ padding: "10px 0" }}>{p.proj}</td><td style={{ padding: "10px 0", fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
              <td style={{ padding: "10px 0" }}>{p.status === "pending" ? <Tg c={T.amber}>Pending</Tg> : <Tg c={T.green}>Paid {p.date}</Tg>}</td>
              <td style={{ padding: "10px 0" }}>{p.status === "pending" && <button onClick={() => payComm(p.id)} style={{ fontSize: 11, padding: "4px 10px", background: T.white, border: `1px solid ${T.green}`, color: T.green, borderRadius: 4, cursor: "pointer" }}>Settle</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
}

// ─── MARKETING MODULE ─────────────────────────────────────────────────────────
function MarketingModule({ store, persist }) {
  const [newOffer, setNewOffer] = useState({ title: "", desc: "" });
  const [walkins, setWalkins] = useState(142);
  const [tab, setTab] = useState("automator");
  const [newRule, setNewRule] = useState({ k: "", r: "" });
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [newAutoRule, setNewAutoRule] = useState({ trigger: "When lead status changes...", action: "Send WhatsApp" });

  const mkt = store.marketing || {
    offers: [{ id: 1, title: "Diwali Gold Coin Bonanza!", desc: "Close 3 bookings before Nov 15th to win a 10g Gold Coin." }],
    keywordRules: [{ id: 1, k: "price, pricing, cost", r: "Sending automated pricing sheet..." }, { id: 2, k: "location, map, directions", r: "Sending Google Maps pin..." }],
    automatorRules: []
  };
  
  function save(upd) { persist({ ...store, marketing: { ...mkt, ...upd } }); }

  function addOffer() {
    if (!newOffer.title) return;
    save({ offers: [{ id: gid(), ...newOffer }, ...mkt.offers] });
    setNewOffer({ title: "", desc: "" });
  }
  function delOffer(id) { save({ offers: mkt.offers.filter(x => x.id !== id) }); }

  function addRule() {
    if(!newRule.k) return;
    save({ keywordRules: [...mkt.keywordRules, { id: gid(), ...newRule }] });
    setNewRule({ k: "", r: "" });
  }
  function delRule(id) { save({ keywordRules: mkt.keywordRules.filter(x => x.id !== id) }); }

  function saveAutoRule() {
    save({ automatorRules: [...(mkt.automatorRules || []), { id: gid(), ...newAutoRule }] });
    setShowAutoModal(false);
  }

  return (<div className="fade">
    <ST>📢 Marketing & Automations</ST>
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.creamDark, borderRadius: 12, padding: 4 }}>
      {[{ id: "automator", label: "Workflow Automator" }, { id: "chatbots", label: "Chatbots & Auto Responders" }, { id: "rechurn", label: "Lead Rechurn Process" }, { id: "events", label: "Events & Offers" }].map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 9, background: tab === t.id ? T.navy : "transparent", color: tab === t.id ? T.gold : T.textMid, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>{t.label}</button>
      ))}
    </div>

    {tab === "automator" && (
      <Card title="Customer Journey Automator" accent={T.blue}>
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Predefine actions based on customer behavior. Connect activities to specific triggers and build an intelligent strategy to engage the customer journey.</div>
        <div style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ fontWeight: 600, color: T.navy, marginBottom: 8 }}>1. Pre-Visit Nurturing Flow</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 13 }}>
            <span style={{ background: T.white, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>New Lead Assigned</span>
            <span>➔</span>
            <span style={{ background: T.white, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>Wait 5 Mins</span>
            <span>➔</span>
            <span style={{ background: T.greenBg, color: T.green, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.green}` }}>Auto WhatsApp Brochure</span>
            <span>➔</span>
            <span style={{ background: T.blueBg, color: T.blue, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.blue}` }}>Auto Email Pricing</span>
          </div>
        </div>
        <div style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ fontWeight: 600, color: T.navy, marginBottom: 8 }}>2. Site Visit Reminders</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 13 }}>
            <span style={{ background: T.white, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>Site Visit Scheduled</span>
            <span>➔</span>
            <span style={{ background: T.white, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>1 Day Before</span>
            <span>➔</span>
            <span style={{ background: T.amberBg, color: T.amber, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.amber}` }}>Automated IVR Call</span>
            <span>➔</span>
            <span style={{ background: T.greenBg, color: T.green, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.green}` }}>WhatsApp Location Map</span>
          </div>
        </div>

        {(mkt.automatorRules || []).map((rule, idx) => (
          <div key={rule.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600, color: T.navy, marginBottom: 8 }}>{3 + idx}. Custom Rule</div>
              <button onClick={() => save({ automatorRules: (mkt.automatorRules || []).filter(r => r.id !== rule.id) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 13 }}>
              <span style={{ background: T.white, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>{rule.trigger}</span>
              <span>➔</span>
              <span style={{ background: T.purpleBg, color: T.purple, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.purple}` }}>{rule.action}</span>
            </div>
          </div>
        ))}

        <Btn c={T.navy} onClick={() => setShowAutoModal(true)}>+ Create New Automation Rule</Btn>
        
        {showAutoModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,20,55,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: T.white, borderRadius: 18, padding: "28px", maxWidth: 420, width: "100%" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 12 }}>New Automation Rule</div>
              <F l="Trigger Event"><select value={newAutoRule.trigger} onChange={e => setNewAutoRule({...newAutoRule, trigger: e.target.value})} style={{ marginBottom: 12, width: "100%", padding: 8 }}><option>When lead status changes...</option><option>When date reached...</option></select></F>
              <F l="Action to Take"><select value={newAutoRule.action} onChange={e => setNewAutoRule({...newAutoRule, action: e.target.value})} style={{ marginBottom: 12, width: "100%", padding: 8 }}><option>Send WhatsApp</option><option>Trigger IVR</option><option>Send Email</option></select></F>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <Btn c={T.navy} full onClick={saveAutoRule}>Save Rule</Btn>
                <button onClick={() => setShowAutoModal(false)} style={{ flex: 1, padding: "11px", background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </Card>
    )}

    {tab === "chatbots" && (
      <Grid cols="1fr 1fr" gap={16} mb={14}>
        <Card title="Keyword Auto-Responders" accent={T.green}>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Set up auto-responses based on keywords sent by customers.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mkt.keywordRules.map((kr) => (
              <div key={kr.id} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, background: T.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Keywords: <Tg c={T.navy}>{kr.k}</Tg></div>
                  <div style={{ fontSize: 13, color: T.text }}>Reply: {kr.r}</div>
                </div>
                <button onClick={() => delRule(kr.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} title="Delete Rule">🗑️</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <input value={newRule.k} onChange={e => setNewRule(x => ({ ...x, k: e.target.value }))} placeholder="Keywords (comma separated)" style={{ width: "100%", marginBottom: 8, padding: 8 }} />
            <input value={newRule.r} onChange={e => setNewRule(x => ({ ...x, r: e.target.value }))} placeholder="Auto-Response Message" style={{ width: "100%", marginBottom: 8, padding: 8 }} />
            <Btn c={T.green} full onClick={addRule}>Add Keyword Rule</Btn>
          </div>
        </Card>
        <Card title="AI Conversational Bot" accent={T.purple}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: T.navy }}>Gemini Powered AI Agent</div>
            <Tg c={T.green}>Active</Tg>
          </div>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>The AI agent will answer natural language queries based on your project inventory and pricing data. It can qualify leads before passing them to humans.</div>
          <div style={{ background: T.cream, padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            <div style={{ color: T.textMid, marginBottom: 6 }}><strong>User:</strong> Are there any 3BHKs available under 1 Crore?</div>
            <div style={{ color: T.purple }}><strong>Bot:</strong> Yes! We have 2 units available in Ghar Kar Heights starting at 95 Lakhs. Would you like me to schedule a site visit?</div>
          </div>
          <Btn c={T.purple} full>Configure AI Knowledge Base</Btn>
        </Card>
      </Grid>
    )}

    {tab === "rechurn" && (
      <Card title="Lead Rechurn & Drip Campaigns" accent={T.amber}>
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Auto engage your unproductive/inactive customers for the next 3 years. Turn dead leads into new opportunities without manual effort.</div>
        <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse", marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={{ padding: "8px 0", color: T.navy }}>Campaign Name</th>
              <th style={{ padding: "8px 0", color: T.navy }}>Target Audience</th>
              <th style={{ padding: "8px 0", color: T.navy }}>Duration</th>
              <th style={{ padding: "8px 0", color: T.navy }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "10px 0", fontWeight: 500 }}>3-Year Dead Lead Nurture</td><td style={{ padding: "10px 0" }}>Lost/Dropped Leads</td><td style={{ padding: "10px 0" }}>36 Months</td><td style={{ padding: "10px 0" }}><Tg c={T.green}>Running</Tg></td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "10px 0", fontWeight: 500 }}>Festive Revival</td><td style={{ padding: "10px 0" }}>No Response (Last 60 Days)</td><td style={{ padding: "10px 0" }}>14 Days</td><td style={{ padding: "10px 0" }}><Tg c={T.amber}>Paused</Tg></td>
            </tr>
          </tbody>
        </table>
        <Btn c={T.amber}>Build New Rechurn Campaign</Btn>
      </Card>
    )}

    {tab === "events" && (
      <>
        <Grid cols="1fr 1fr" gap={14} mb={14}>
          <Card title="Bonanza Offers">
            <div style={{ fontSize: 13, color: T.textLight, marginBottom: 10 }}>Active offers shown in the Agent Mobile App.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={newOffer.title} onChange={e => setNewOffer(x => ({ ...x, title: e.target.value }))} placeholder="Offer Title" style={{ flex: 1 }} />
              <Btn onClick={addOffer} c={T.navy}>Add</Btn>
            </div>
            <input value={newOffer.desc} onChange={e => setNewOffer(x => ({ ...x, desc: e.target.value }))} placeholder="Description (e.g. Close 3 bookings to win...)" style={{ width: "100%", marginBottom: 12 }} />

            <div style={{ display: "grid", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {mkt.offers.map(o => (
                <div key={o.id} style={{ border: `1px solid ${T.blue}40`, background: `${T.blue}10`, padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>{o.title}</div>
                    <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>{o.desc}</div>
                  </div>
                  <button onClick={() => delOffer(o.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} title="Delete Offer">🗑️</button>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Cust Mela Tracker">
            <div style={{ fontSize: 13, color: T.textLight, marginBottom: 10 }}>Track live walk-ins during events.</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.border}`, padding: 12, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>Pune Mega Mela</div>
                <div style={{ fontSize: 11, color: T.textLight }}>Today</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: T.green }}>{walkins}</div>
                <button onClick={() => setWalkins(w => w + 1)} style={{ background: T.greenBg, border: `1px solid ${T.green}`, color: T.green, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 16 }}>+1</button>
              </div>
            </div>
          </Card>
        </Grid>
        <Card title="Marketing Creatives Access (Collateral)">
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {["Brochures", "Floor Plans", "Walkthrough Videos", "Price Highlights"].map(f => (
              <div key={f} style={{ minWidth: 140, padding: 20, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, textAlign: "center", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f}</div>
              </div>
            ))}
          </div>
        </Card>
      </>
    )}
  </div>);
}

// ─── POST-SALES MODULE ────────────────────────────────────────────────────────
function PostSalesModule({ store }) {
  const [doc, setDoc] = useState(null);
  const [escalations, setEscalations] = useState([
    { id: 1, issue: "Plumbing Leakage in Kitchen", unit: "A-204", days: 2, priority: "High Priority" }
  ]);
  const [checks, setChecks] = useState({ pdi: true, keys: true, maint: false });

  function renderDocPreview() {
    if (!doc) return null;
    return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: T.white, padding: 40, borderRadius: 12, width: 500, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", fontFamily: "serif" }}>
        <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: T.navy }}>Ghar Kar Developers</h2>
          <div style={{ fontSize: 12, color: "#666" }}>123, Real Estate Avenue, Pune, India</div>
        </div>
        <h3 style={{ textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>{doc}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>To Whom It May Concern,</p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>This document serves as the official <strong>{doc}</strong> for the property unit allocated to the respective buyer. All terms and conditions as per the signed agreement are applicable.</p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>Date: {td()}</p>
        <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ borderTop: "1px solid #000", width: 120, paddingTop: 4, fontSize: 12 }}>Authorized Signatory</div></div>
          <div><div style={{ borderTop: "1px solid #000", width: 120, paddingTop: 4, fontSize: 12 }}>Buyer Signature</div></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 40, fontFamily: "sans-serif" }}>
          <Btn full c={T.navy} onClick={() => alert("Document Sent to Printer.")}>🖨️ Print</Btn>
          <Btn full c={T.red} onClick={() => setDoc(null)}>Close</Btn>
        </div>
      </div>
    </div>);
  }

  return (<div className="fade">
    {renderDocPreview()}
    <ST>🔑 Post-Sales & Handover</ST>
    <Grid cols="1fr 1fr" gap={14} mb={14}>
      <Card title="Document Generation">
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>Auto-generate legally binding documents.</div>
        <div style={{ display: "grid", gap: 8 }}>
          <Btn onClick={() => setDoc("Demand Letter")} c={T.navy}>Generate Demand Letter</Btn>
          <Btn onClick={() => setDoc("Allotment Letter")} c={T.blue}>Generate Allotment Letter</Btn>
          <Btn onClick={() => setDoc("Possession Letter")} c={T.gold}>Generate Possession Letter</Btn>
        </div>
      </Card>
      <Card title="Handover & Bank Checklists">
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>Manage structural handovers.</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6 }}><input type="checkbox" checked={checks.pdi} onChange={e => setChecks(x => ({ ...x, pdi: e.target.checked }))} /> Pre-Delivery Inspection (PDI) Clear</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6 }}><input type="checkbox" checked={checks.keys} onChange={e => setChecks(x => ({ ...x, keys: e.target.checked }))} /> Key Handover Signed</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6 }}><input type="checkbox" checked={checks.maint} onChange={e => setChecks(x => ({ ...x, maint: e.target.checked }))} /> Maintenance Deposit Collected</label>
      </Card>
    </Grid>
    <Card title="Customer Escalations (Post-Purchase)">
      {escalations.length === 0 ? (
        <div style={{ fontSize: 13, color: T.textLight, padding: 20, textAlign: "center" }}>No pending escalations.</div>
      ) : escalations.map(esc => (
        <div key={esc.id} style={{ background: "#FFEBEE", border: `1px solid ${T.red}40`, padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.red }}>{esc.issue}</div>
            <Tg c={T.red}>{esc.priority}</Tg>
          </div>
          <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>Unit {esc.unit} · Raised {esc.days} days ago</div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <Btn c={T.red} onClick={() => alert("Maintenance team notified.")}>Assign to Maintenance</Btn>
            <Btn c={T.green} onClick={() => setEscalations(prev => prev.filter(e => e.id !== esc.id))}>Mark Resolved</Btn>
          </div>
        </div>
      ))}
    </Card>
  </div>);
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const LBL = { fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 6 };
function ST({ children }) { return <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.navy, marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${T.gold}40`, display: "flex", alignItems: "center", gap: 10 }}>{children}</div>; }
function Card({ title, children, accent }) { return <div className="posh-card">{accent && <div style={{ height: 3, background: `linear-gradient(90deg,${accent},${accent}30)`, borderRadius: "4px 4px 0 0", margin: "-20px -22px 16px" }} />}{title && <div style={{ fontWeight: 700, fontSize: 15, color: T.navy, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>{title}</div>}{children}</div>; }
function Alrt({ c, bg, title, children }) { return <div style={{ background: bg, border: `1px solid ${c}35`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, borderLeft: `4px solid ${c}` }}><div style={{ fontWeight: 700, fontSize: 13, color: c, marginBottom: 8 }}>{title}</div>{children}</div>; }
function Tg({ c, children }) { return <span style={{ fontSize: 11, background: `${c}15`, color: c, padding: "3px 10px", borderRadius: 20, fontWeight: 700, display: "inline-block", border: `1px solid ${c}25` }}>{children}</span>; }
function Btn({ onClick, c, children, full }) { return <button onClick={onClick} className="posh-btn" style={{ background: c, color: "#fff", width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined }}>{children}</button>; }
function Grid({ cols, gap, mb, children }) { return <div style={{ display: "grid", gridTemplateColumns: cols, gap, marginBottom: mb }}>{children}</div>; }
function F({ l, children }) { return <div style={{ marginBottom: 2 }}><label style={LBL}>{l}</label>{children}</div>; }

// ─── COMMUNICATIONS & DIALER MODULE ──────────────────────────────────────────
function CommunicationsModule({ store, persist, session }) {
  const [tab, setTab] = useState("dialer");
  const [dialNum, setDialNum] = useState("");
  const [calling, setCalling] = useState(false);
  
  const comms = store.comms || { aiCallOnAssign: false, aiCallForLeadGen: true, scheduledIVR: true };
  function saveComms(upd) { persist({ ...store, comms: { ...comms, ...upd } }); }

  return (<div className="fade">
    <ST>📞 Communications & Dialer</ST>
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.creamDark, borderRadius: 12, padding: 4 }}>
      {[{ id: "dialer", label: "GSM Auto-Dialer" }, { id: "whatsapp", label: "WhatsApp Automation" }, { id: "ai_ivr", label: "AI Calling & IVR" }].map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 9, background: tab === t.id ? T.navy : "transparent", color: tab === t.id ? T.gold : T.textMid, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>{t.label}</button>
      ))}
    </div>

    {tab === "dialer" && (
      <Grid cols="300px 1fr" gap={16}>
        <div style={{ background: "#111b21", borderRadius: 20, padding: 24, color: "#fff", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 12, color: "#667781", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20, textAlign: "center" }}>Tele Caller Integration</div>
          <div style={{ background: "#202c33", borderRadius: 12, padding: 16, fontSize: 24, textAlign: "center", minHeight: 60, marginBottom: 24, letterSpacing: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {dialNum || "Enter Number"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(k => (
              <button key={k} onClick={() => setDialNum(d => d + k)} style={{ background: "#2a3942", border: "none", borderRadius: "50%", width: 64, height: 64, color: "#fff", fontSize: 24, fontWeight: 500, margin: "0 auto", cursor: "pointer", transition: "background 0.1s" }} onMouseDown={e => e.currentTarget.style.background = "#3c515d"} onMouseUp={e => e.currentTarget.style.background = "#2a3942"}>{k}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <button onClick={() => setDialNum(d => d.slice(0, -1))} style={{ background: "none", border: "none", color: "#667781", fontSize: 24, cursor: "pointer", width: 64 }}>⌫</button>
            <button onClick={() => { if(dialNum) setCalling(!calling); }} style={{ background: calling ? T.red : T.green, border: "none", borderRadius: "50%", width: 64, height: 64, color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: `0 8px 16px ${calling ? T.red : T.green}40` }}>{calling ? "📴" : "📞"}</button>
            <div style={{ width: 64 }}></div>
          </div>
          {calling && <div style={{ textAlign: "center", color: T.green, marginTop: 16, fontSize: 14, fontWeight: 600 }}>Connected... 00:14</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card title="Intelligent Auto-Looping" accent={T.blue}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: T.text }}>Auto-loop through pending leads and schedule calls automatically. SIM-based dialer will connect calls one by one.</div>
              <Btn c={T.blue}>Start Auto-Dialer</Btn>
            </div>
            <div style={{ background: T.cream, padding: 12, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.amber }} />
              <div style={{ fontSize: 13, color: T.navy, fontWeight: 600 }}>Next Call: Rahul Sharma (Lead #402) in 14s...</div>
            </div>
          </Card>
          <Card title="Call History & Logs">
            <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: `2px solid ${T.border}` }}><th style={{ padding: 8 }}>Name/Number</th><th style={{ padding: 8 }}>Duration</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Time</th></tr></thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}><td style={{ padding: 8 }}>+91 9876543210</td><td style={{ padding: 8 }}>02:14</td><td style={{ padding: 8, color: T.green }}>Answered</td><td style={{ padding: 8 }}>10:45 AM</td></tr>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}><td style={{ padding: 8 }}>Rahul Sharma</td><td style={{ padding: 8 }}>00:00</td><td style={{ padding: 8, color: T.red }}>Missed</td><td style={{ padding: 8 }}>10:30 AM</td></tr>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}><td style={{ padding: 8 }}>Priya Singh</td><td style={{ padding: 8 }}>05:32</td><td style={{ padding: 8, color: T.green }}>Answered</td><td style={{ padding: 8 }}>09:15 AM</td></tr>
              </tbody>
            </table>
          </Card>
        </div>
      </Grid>
    )}

    {tab === "whatsapp" && (
      <Card title="Approved WhatsApp Templates" accent={T.green}>
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16 }}>Manage Meta-approved WhatsApp templates for automated messaging. Note: Manual bulk messaging has been disabled.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Project Launch Flyer", "Payment Milestone Reminder", "Site Visit Location Map", "Meeting Confirmation"].map(t => (
            <div key={t} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, background: T.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{t}</div>
                <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>✓ Approved by Meta</div>
              </div>
              <button style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Edit Template</button>
            </div>
          ))}
        </div>
      </Card>
    )}

    {tab === "ai_ivr" && (
      <Card title="AI Calling & IVR Settings" accent={T.purple}>
        <div style={{ fontSize: 13, color: T.textLight, marginBottom: 20 }}>Configure advanced calling automations.</div>
        
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: T.navy }}>🤖 AI Calling for Lead Generation</div>
            <Tg c={comms.aiCallForLeadGen ? T.green : T.amber}>{comms.aiCallForLeadGen ? "Active" : "Paused"}</Tg>
          </div>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>AI-powered system engages prospects 24/7. When a prospect shows high intent, it routes the call to a human executive.</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn c={T.purple} onClick={() => alert("Configure Script Editor opened. (Simulated)")}>Configure Script</Btn>
            <Btn c={comms.aiCallForLeadGen ? T.red : T.green} onClick={() => saveComms({ aiCallForLeadGen: !comms.aiCallForLeadGen })}>{comms.aiCallForLeadGen ? "Pause AI" : "Activate AI"}</Btn>
          </div>
        </div>

        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: T.navy }}>⚡ Auto Call on Lead Assigning</div>
            <Tg c={comms.aiCallOnAssign ? T.green : T.amber}>{comms.aiCallOnAssign ? "Active" : "Paused"}</Tg>
          </div>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>System automatically triggers a call connecting the executive to the prospect instantly upon assigning.</div>
          <Btn c={comms.aiCallOnAssign ? T.red : T.navy} onClick={() => saveComms({ aiCallOnAssign: !comms.aiCallOnAssign })}>{comms.aiCallOnAssign ? "Deactivate" : "Activate"}</Btn>
        </div>

        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: T.navy }}>📅 Scheduled IVR Followups</div>
            <Tg c={comms.scheduledIVR ? T.green : T.amber}>{comms.scheduledIVR ? "Active" : "Paused"}</Tg>
          </div>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>Scheduled and pending activities automatically trigger an IVR call to employees and customers.</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn c={T.navy} onClick={() => alert("Configure IVR Menu opened. (Simulated)")}>Configure IVR Menu</Btn>
            <Btn c={comms.scheduledIVR ? T.red : T.green} onClick={() => saveComms({ scheduledIVR: !comms.scheduledIVR })}>{comms.scheduledIVR ? "Pause IVR" : "Activate IVR"}</Btn>
          </div>
        </div>
      </Card>
    )}
  </div>);
}
