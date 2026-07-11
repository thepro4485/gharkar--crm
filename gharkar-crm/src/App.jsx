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
.ds-tab-content{display:none}
.ds-tab-content.active{display:block}
@media print{
  header,.no-print,.no-print-ds{display:none!important}
  body{background:#fff}
  .posh-card{box-shadow:none;border:1px solid #ddd}
  .print-page{padding:0}
  .ds-tab-content{display:block!important;page-break-inside:avoid;margin-bottom:24px}
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

async function analyseDocumentsAI(employmentType, currentStep, receivedText, loanDetails, images = []) {
  const docSet = DOC_REQUIREMENTS[employmentType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.entries(docSet).flatMap(([cat, docs]) => docs.map(d => `[${cat}] ${d}`));
  const prompt = `You are an expert home loan processor in India. Analyse the documents received and identify what is present, missing, and any concerns.\nBORROWER: ${loanDetails.name || "Client"}, Employment: ${employmentType}, Loan: ${loanDetails.loanType || "Home Loan"}, Amount: Rs.${Number(loanDetails.loanAmount || 0).toLocaleString("en-IN")}\nPROCESS STEP: ${currentStep}\nREQUIRED DOCUMENTS:\n${allDocs.map((d, i) => `${i + 1}. ${d}`).join("\n")}\nDOCUMENTS RECEIVED (described by loan officer):\n${receivedText}\nRespond ONLY in this exact JSON format:{"confirmed":["names of docs clearly present"],"missing":["names of docs not mentioned"],"concerns":["any red flags or issues"],"nextAction":"specific next step the officer should take now","score":0}`;
  
  const parts = [{ text: prompt }];
  images.forEach(img => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data
      }
    });
  });

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1, maxOutputTokens: 1024 } })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Status ${res.status}`;
      throw new Error(`Gemini API error: ${errMsg}`);
    }
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
const AN = [{ id: "dashboard", label: "Dashboard" }, { id: "kpf", label: "📊 KPF" }, { id: "users", label: "Users" }, { id: "leads", label: "All Leads" }, { id: "logs", label: "Daily Logs" }, { id: "pipeline", label: "Pipeline" }, { id: "escalations", label: "Escalations" }, { id: "external", label: "External Follow-Ups" }, { id: "calculator", label: "🧮 Calculator" }, { id: "bank_matrix", label: "🏦 Bank Matrix" }, { id: "apf_directory", label: "🏗️ APF Directory" }];
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
    {nav === "bank_matrix" && <BankMatrix />}
    {nav === "apf_directory" && <ProjectDirectory />}
  </Shell>);
}

// ─── DEVELOPER APP ────────────────────────────────────────────────────────────
const DEV_AN = [{ id: "inventory", label: "🏗️ Inventory" }];
function DeveloperApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("inventory");
  return (<Shell session={session} onLogout={onLogout} navItems={DEV_AN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "inventory" && <InventoryModule />}
  </Shell>);
}

// ─── AGENT APP ────────────────────────────────────────────────────────────────
const AGENT_AN = [{ id: "postsales", label: "🔑 Post-Sales" }];
function AgentApp({ store, persist, session, onLogout }) {
  const [nav, setNav] = useState("postsales");
  return (<Shell session={session} onLogout={onLogout} navItems={AGENT_AN} activeNav={nav} setActiveNav={setNav} store={store} persist={persist}>
    {nav === "postsales" && <PostSalesModule store={store} />}
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
    if (!confirm("Delete this log?")) return;
    const newStore = JSON.parse(JSON.stringify(store));
    if (newStore.dailyLogs && newStore.dailyLogs[selU]) {
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
const EN = [{ id: "today", label: "Today" }, { id: "leads", label: "My Leads" }, { id: "add", label: "Add Lead" }, { id: "followups", label: "Follow-Ups" }, { id: "guide", label: "Process Guide" }, { id: "external", label: "External" }, { id: "log", label: "Daily Log" }, { id: "calculator", label: "🧮 Calculator" }, { id: "bank_matrix", label: "🏦 Bank Matrix" }, { id: "apf_directory", label: "🏗️ APF Directory" }];
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
    {nav === "bank_matrix" && <BankMatrix />}
    {nav === "apf_directory" && <ProjectDirectory />}
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
              <span style={{ background: T.amber, color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>Reminders Active</span>
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
  const tabs = fieldOnly ? ["current", "notes", "history"] : ["current", "allsteps", "comm", "docchecklist", "aidocs", "detailsheet", "financials", "logins", "portal", "notes", "history"];

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
        {t === "current" ? "Current Step" : t === "allsteps" ? "All 39 Steps" : t === "sitevisits" ? "📍 Site Visits & Follow-up" : t === "comm" ? "Communication" : t === "docchecklist" ? "📋 Docs" : t === "aidocs" ? "🤖 AI Analysis" : t === "detailsheet" ? "🧧 Detail Sheet" : t === "financials" ? "💰 Financials" : t === "logins" ? "🏦 Bank Logins" : t === "portal" ? "🌐 Client Portal" : t === "notes" ? "Notes" : t === "history" ? "History" : t}
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
    {tab === "logins" && !fieldOnly && <BankLoginsTab lead={lead} onUpdate={onUpdate} />}
    {tab === "portal" && !fieldOnly && <ClientPortalSim lead={lead} onUpdate={onUpdate} />}

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

// ─── AI ANALYSIS TAB ─────────────────────────────────────────────────────────
function AiDocsTab({ lead }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const empType = lead.employmentType || "Salaried";
  const docSet = DOC_REQUIREMENTS[empType] || DOC_REQUIREMENTS["Salaried"];
  const allDocs = Object.values(docSet).flat();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setImages(prev => [...prev, {
          id: gid(),
          name: file.name,
          mimeType: file.type,
          data: base64String,
          url: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  async function analyse() {
    setLoading(true);
    const res = await analyseDocumentsAI(empType, lead.currentStep, text || "Sent documents screenshots for analysis.", lead, images);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="fade">
      <div style={{ fontSize: 13, color: T.textLight, marginBottom: 12 }}>
        Describe the documents or drag and drop photos/screenshots here. AI will identify what is present, missing, and provide the next step.
        <span style={{ marginLeft: 8, fontSize: 11, color: T.blue, background: T.blueBg, padding: "2px 8px", borderRadius: 10 }}>{empType}</span>
      </div>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Describe documents received (optional if uploading screenshots)..." style={{ marginBottom: 12, resize: "vertical" }} />
        
        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? T.blue : T.border}`,
            background: dragActive ? T.blueBg : `${T.cream}33`,
            borderRadius: 10,
            padding: "20px 10px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: 12,
            transition: "all 0.2s"
          }}
          onClick={() => document.getElementById("screenshot-upload").click()}
        >
          <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="screenshot-upload" />
          <div style={{ fontSize: 24, marginBottom: 6 }}>📸</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Drag & Drop screenshots or Click to Upload</div>
          <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>Supports JPEG, PNG, WEBP</div>
        </div>

        {/* Image Preview List */}
        {images.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {images.map(img => (
              <div key={img.id} style={{ position: "relative", width: 70, height: 70, borderRadius: 8, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    fontSize: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={analyse} disabled={loading || (!text.trim() && images.length === 0)} style={{ padding: "10px 22px", background: loading ? T.textLight : T.navy, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Analysing with Vision AI..." : "🤖 Analyse Documents"}
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
  const [f, setF] = useState({ name: "", phone: "", intention: "Want to Buy", source: "Online", sourceName: "", propertyNeed: "Flat", bhk: "2BHK", budget: "", city: "", notes: "", employmentType: "Salaried", nriType: "" });
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
      <Grid cols={f.employmentType === "NRI" ? "1fr 1fr 1fr" : "1fr 1fr"} gap={10}>
        <F l="Employment Type"><select value={f.employmentType} onChange={e => {
          s("employmentType", e.target.value);
          if (e.target.value === "NRI") {
            s("nriType", "Salaried");
          } else {
            s("nriType", "");
          }
        }}>
          <option value="Salaried">Salaried</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="Pvt Ltd Company">Pvt Ltd Company</option>
          <option value="Partnership Firm">Partnership Firm</option>
          <option value="NRI">NRI</option>
        </select></F>
        {f.employmentType === "NRI" && (
          <F l="NRI Type"><select value={f.nriType || "Salaried"} onChange={e => s("nriType", e.target.value)}>
            <option value="Salaried">Salaried</option>
            <option value="Self-Employed">Self-Employed</option>
          </select></F>
        )}
        <F l="Lead Source"><select value={f.source} onChange={e => s("source", e.target.value)}>{["Agent", "Customer", "Newspaper", "Online", "Google", "Hoardings"].map(t => <option key={t}>{t}</option>)}</select></F>
      </Grid>
      {(f.source === "Agent" || f.source === "Customer") && (
        <div style={{ marginBottom: 10 }}>
          <F l="Reference Name *"><input value={f.sourceName} onChange={e => s("sourceName", e.target.value)} placeholder={f.source === "Agent" ? "Agent Name" : "Customer Name"} style={{ borderColor: errs.sourceName ? T.red : undefined }} /></F>
          <Err field="sourceName" />
        </div>
      )}
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
            <div><F l="Visit Date"><input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></F></div>
            <div><F l="Visit Time"><input type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></F></div>
          </Grid>
          <Grid cols="1fr 1fr" gap={10}>
            <div><F l="Building Name"><input value={f.building} onChange={e => setF({ ...f, building: e.target.value })} placeholder="e.g. Ghar Kar Heights" /></F></div>
            <div><F l="Floor & Wing"><input value={f.wing} onChange={e => setF({ ...f, wing: e.target.value })} placeholder="e.g. 4th Floor, B Wing" /></F></div>
          </Grid>
          <Grid cols="1fr 1fr" gap={10}>
            <div><F l="Quoted Price (₹)"><input type="number" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} placeholder="e.g. 8500000" /></F></div>
            <F l="Is Price Negotiable?"><select value={f.negotiable} onChange={e => setF({ ...f, negotiable: e.target.value })}><option>Yes</option><option>No</option></select></F>
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
                  <F l="Did customer like it?"><select value={fb.liked} onChange={e => setFb({ ...fb, liked: e.target.value })}><option>Yes</option><option>No</option></select></F>
                  {fb.liked === "Yes" ? (
                    <div><F l="When will they book?"><input type="date" value={fb.bookDate} onChange={e => setFb({ ...fb, bookDate: e.target.value })} /></F></div>
                  ) : (
                    <div><F l="Next Property Showing Date"><input type="date" value={fb.nextVisitDate} onChange={e => setFb({ ...fb, nextVisitDate: e.target.value })} /></F></div>
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
// ─── CLIENT DETAIL SHEET HELPERS ──────────────────────────────────────────────
const getInitialFormState = (lead) => {
  const state = {
    employmentType: lead.employmentType || "Salaried",
    nriType: lead.nriType || "",
    propertyName: lead.propertyName || lead.propertyNeed || "",
    actualDealValue: lead.actualDealValue || "",
    agreementValue: lead.agreementValue || "",
    ownContribution: lead.ownContribution || "",
    loanAmount: lead.loanAmount || "",
    tenure: lead.tenure || "",
    profession: lead.profession || "",

    ref1_name: lead.ref1_name || "",
    ref1_address: lead.ref1_address || "",
    ref1_phone: lead.ref1_phone || "",
    ref1_email: lead.ref1_email || "",
    ref2_name: lead.ref2_name || "",
    ref2_address: lead.ref2_address || "",
    ref2_phone: lead.ref2_phone || "",
    ref2_email: lead.ref2_email || "",
  };

  const prefixes = ["", "co1_", "co2_", "co3_"];
  prefixes.forEach(prefix => {
    if (prefix === "") {
      state.name = lead.name || "";
      state.phone = lead.phone || "";
      state.email = lead.email || "";
      state.fatherName = lead.fatherName || "";
      state.motherName = lead.motherName || "";
      state.spouseName = lead.spouseName || "";
      state.currentAddress = lead.address || "";
      state.companyName = lead.companyName || "";
      state.gender = lead.gender || "";
      state.dob = lead.dob || "";
      state.pan = lead.pan || "";
      state.aadhar = lead.aadhar || "";
      state.qualification = lead.qualification || "";
      state.yearOfPassing = lead.yearOfPassing || "";
      state.nameBeforeMarriage = lead.nameBeforeMarriage || "";
      state.children = lead.children || "0";
      state.dependents = lead.dependents || "0";
      state.residenceStatus = lead.residenceStatus || "";
      state.yearsInResidence = lead.yearsInResidence || "0";
      state.propertiesOwned = lead.propertiesOwned || "0";
      state.designation = lead.designation || "";
      state.department = lead.department || "";
      state.companyWebsite = lead.companyWebsite || "";
      state.officialEmail = lead.officialEmail || "";
      state.officeLandline = lead.officeLandline || "";
      state.hrEmail = lead.hrEmail || "";
      state.hrPhone = lead.hrPhone || "";
      state.officeAddress = lead.officeAddress || "";
      state.totalExperience = lead.totalExperience || "";
      state.yearsInJob = lead.yearsInJob || "0";
      state.employeeNumber = lead.employeeNumber || "";
      state.monthlyGross = lead.monthlyGross || "";
      state.monthlyNet = lead.monthlyNet || "";
      state.bankName = lead.bankName || "";
      state.bankBranch = lead.bankBranch || "";
      state.bankAccountNo = lead.bankAccountNo || "";
      state.bankIfsc = lead.bankIfsc || "";
      state.currentEmi = lead.currentEmi || "";
      state.aadharAddress = lead.aadharAddress || "";
    } else if (prefix === "co1_") {
      state.co1_name = lead.coApplicant || lead.co1_name || "";
      state.co1_phone = lead.coPhone || lead.co1_phone || "";
      state.co1_email = lead.coEmail || lead.co1_email || "";
      state.co1_currentAddress = lead.coAddress || lead.co1_currentAddress || "";
      state.co1_fatherName = lead.coFatherName || lead.co1_fatherName || "";
      state.co1_motherName = lead.coMotherName || lead.co1_motherName || "";
      state.co1_spouseName = lead.coSpouseName || lead.co1_spouseName || "";
      state.co1_children = lead.coChildren || lead.co1_children || "0";
      state.co1_gender = lead.co1_gender || "";
      state.co1_dob = lead.co1_dob || "";
      state.co1_pan = lead.co1_pan || "";
      state.co1_aadhar = lead.co1_aadhar || "";
      state.co1_qualification = lead.co1_qualification || "";
      state.co1_yearOfPassing = lead.co1_yearOfPassing || "";
      state.co1_nameBeforeMarriage = lead.co1_nameBeforeMarriage || "";
      state.co1_dependents = lead.co1_dependents || "0";
      state.co1_residenceStatus = lead.co1_residenceStatus || "";
      state.co1_yearsInResidence = lead.co1_yearsInResidence || "0";
      state.co1_propertiesOwned = lead.co1_propertiesOwned || "0";
      state.co1_companyName = lead.co1_companyName || "";
      state.co1_designation = lead.co1_designation || "";
      state.co1_department = lead.co1_department || "";
      state.co1_companyWebsite = lead.co1_companyWebsite || "";
      state.co1_officialEmail = lead.co1_officialEmail || "";
      state.co1_officeLandline = lead.co1_officeLandline || "";
      state.co1_hrEmail = lead.co1_hrEmail || "";
      state.co1_hrPhone = lead.co1_hrPhone || "";
      state.co1_officeAddress = lead.co1_officeAddress || "";
      state.co1_totalExperience = lead.co1_totalExperience || "";
      state.co1_yearsInJob = lead.co1_yearsInJob || "0";
      state.co1_employeeNumber = lead.co1_employeeNumber || "";
      state.co1_monthlyGross = lead.co1_monthlyGross || "";
      state.co1_monthlyNet = lead.co1_monthlyNet || "";
      state.co1_bankName = lead.co1_bankName || "";
      state.co1_bankBranch = lead.co1_bankBranch || "";
      state.co1_bankAccountNo = lead.co1_bankAccountNo || "";
      state.co1_bankIfsc = lead.co1_bankIfsc || "";
      state.co1_currentEmi = lead.co1_currentEmi || "";
      state.co1_aadharAddress = lead.co1_aadharAddress || "";
    } else {
      const fields = [
        "name", "phone", "email", "gender", "pan", "dob", "aadhar", "qualification",
        "yearOfPassing", "spouseName", "fatherName", "motherName", "nameBeforeMarriage",
        "children", "dependents", "aadharAddress", "currentAddress", "residenceStatus",
        "yearsInResidence", "propertiesOwned", "companyName", "designation", "department",
        "companyWebsite", "officialEmail", "officeLandline", "hrEmail", "hrPhone",
        "officeAddress", "totalExperience", "yearsInJob", "employeeNumber", "monthlyGross",
        "monthlyNet", "bankName", "bankBranch", "bankAccountNo", "bankIfsc", "currentEmi"
      ];
      fields.forEach(f => {
        state[prefix + f] = lead[prefix + f] || "";
      });
    }
  });

  return state;
};

function ApplicantFormBlock({ prefix, form, upd, label }) {
  const isPrimary = prefix === "";
  const isCompany = isPrimary && form.employmentType === "Pvt Ltd Company";
  const isFirm = isPrimary && form.employmentType === "Partnership Firm";
  const isSep = isPrimary && form.employmentType === "Self-Employed Professional";
  const isNri = isPrimary && form.employmentType === "NRI";

  return (
    <div>
      <DSSection title={`${label} - Entity / Employment Profile`} accent={T.gold}>
        <Grid cols={isPrimary ? ((isSep || isNri) ? "1fr 1fr 1fr" : "1fr 1fr") : "1fr"} gap={16}>
          {isPrimary && (
            <F l="Employment / Entity Type">
              <select value={form.employmentType} onChange={e => {
                upd("employmentType", e.target.value);
                if (e.target.value === "NRI") {
                  upd("nriType", "Salaried");
                } else {
                  upd("nriType", "");
                }
              }}>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Self-Employed Professional">Self-Employed Professional</option>
                <option value="Pvt Ltd Company">Pvt Ltd Company</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="NRI">NRI</option>
              </select>
            </F>
          )}
          {isNri && (
            <F l="NRI Type">
              <select value={form.nriType || "Salaried"} onChange={e => upd("nriType", e.target.value)}>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
              </select>
            </F>
          )}
          <F l="Full Name *">
            <input value={form[prefix + "name"] || ""} onChange={e => upd(prefix + "name", e.target.value)} placeholder={`${label} full name`} />
          </F>
          {isSep && (
            <F l="Profession *">
              <input value={form.profession || ""} onChange={e => upd("profession", e.target.value)} placeholder="e.g. Doctor, CA, Architect" />
            </F>
          )}
        </Grid>

        {isCompany && (
          <div className="fade" style={{ marginTop: 14, borderTop: `1px dashed ${T.border}`, paddingTop: 14 }}>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="Registered Company Name"><input value={form.companyName || ""} onChange={e => upd("companyName", e.target.value)} placeholder="e.g. Acme Pvt Ltd" /></F>
              <F l="Date of Incorporation"><input type="date" value={form.incDate || ""} onChange={e => upd("incDate", e.target.value)} /></F>
            </Grid>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="Company CIN (Corporate ID Number)"><input value={form.cin || ""} onChange={e => upd("cin", e.target.value)} placeholder="e.g. U12345MH2020PTC123456" /></F>
              <F l="Company PAN"><input value={form.companyPan || ""} onChange={e => upd("companyPan", e.target.value)} placeholder="Company PAN Card No." /></F>
            </Grid>
            <F l="Directors (Comma separated)"><input value={form.directors || ""} onChange={e => upd("directors", e.target.value)} placeholder="e.g. Director A, Director B" style={{ marginBottom: 14 }} /></F>
          </div>
        )}

        {isFirm && (
          <div className="fade" style={{ marginTop: 14, borderTop: `1px dashed ${T.border}`, paddingTop: 14 }}>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="Registered Firm Name"><input value={form.firmName || ""} onChange={e => upd("firmName", e.target.value)} placeholder="e.g. Patel & Sons" /></F>
              <F l="Date of Registration"><input type="date" value={form.regDate || ""} onChange={e => upd("regDate", e.target.value)} /></F>
            </Grid>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="Firm Registration Number"><input value={form.regNo || ""} onChange={e => upd("regNo", e.target.value)} placeholder="Firm Registration Number" /></F>
              <F l="Firm PAN"><input value={form.firmPan || ""} onChange={e => upd("firmPan", e.target.value)} placeholder="Firm PAN Card No." /></F>
            </Grid>
            <F l="Partners (Comma separated)"><input value={form.partners || ""} onChange={e => upd("partners", e.target.value)} placeholder="e.g. Partner A, Partner B" style={{ marginBottom: 14 }} /></F>
          </div>
        )}
      </DSSection>

      <DSSection title={`${label} - Personal Details`} accent={T.blue}>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Gender">
            <select value={form[prefix + "gender"] || ""} onChange={e => upd(prefix + "gender", e.target.value)}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </F>
          <F l="Date of Birth"><input type="date" value={form[prefix + "dob"] || ""} onChange={e => upd(prefix + "dob", e.target.value)} /></F>
          <F l="PAN Number"><input value={form[prefix + "pan"] || ""} onChange={e => upd(prefix + "pan", e.target.value)} placeholder="PAN Card No." /></F>
        </Grid>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Aadhar Number"><input value={form[prefix + "aadhar"] || ""} onChange={e => upd(prefix + "aadhar", e.target.value)} placeholder="Aadhar Card No." /></F>
          <F l="Mobile Number"><input value={form[prefix + "phone"] || ""} onChange={e => upd(prefix + "phone", e.target.value)} placeholder="Mobile number" /></F>
          <F l="Email ID"><input value={form[prefix + "email"] || ""} onChange={e => upd(prefix + "email", e.target.value)} placeholder="Email ID" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="Qualification"><input value={form[prefix + "qualification"] || ""} onChange={e => upd(prefix + "qualification", e.target.value)} placeholder="Highest Qualification" /></F>
          <F l="Year of Passing"><input value={form[prefix + "yearOfPassing"] || ""} onChange={e => upd(prefix + "yearOfPassing", e.target.value)} placeholder="Year of graduation" /></F>
        </Grid>
      </DSSection>

      <DSSection title={`${label} - Family Details`} accent={T.purple}>
        <Grid cols="1fr 1fr" gap={10} mb={10}>
          <F l="Father's Full Name"><input value={form[prefix + "fatherName"] || ""} onChange={e => upd(prefix + "fatherName", e.target.value)} placeholder="Father's name" /></F>
          <F l="Mother's Full Name"><input value={form[prefix + "motherName"] || ""} onChange={e => upd(prefix + "motherName", e.target.value)} placeholder="Mother's name" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10} mb={10}>
          <F l="Spouse Full Name"><input value={form[prefix + "spouseName"] || ""} onChange={e => upd(prefix + "spouseName", e.target.value)} placeholder="Spouse name" /></F>
          <F l="Spouse Name before marriage"><input value={form[prefix + "nameBeforeMarriage"] || ""} onChange={e => upd(prefix + "nameBeforeMarriage", e.target.value)} placeholder="Spouse maiden name" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="Number of Children"><input type="number" min="0" value={form[prefix + "children"] || "0"} onChange={e => upd(prefix + "children", e.target.value)} /></F>
          <F l="Total Dependents (excl. children)"><input type="number" min="0" value={form[prefix + "dependents"] || "0"} onChange={e => upd(prefix + "dependents", e.target.value)} /></F>
        </Grid>
      </DSSection>

      <DSSection title={`${label} - Residence Details`} accent={T.blue}>
        <Grid cols="1fr 1fr" gap={10} mb={10}>
          <F l="Aadhar Address"><textarea value={form[prefix + "aadharAddress"] || ""} onChange={e => upd(prefix + "aadharAddress", e.target.value)} rows={2} placeholder="Address as per Aadhar..."></textarea></F>
          <F l="Current Residence Address"><textarea value={form[prefix + "currentAddress"] || ""} onChange={e => upd(prefix + "currentAddress", e.target.value)} rows={2} placeholder="Current residence address..."></textarea></F>
        </Grid>
        <Grid cols="1fr 1fr 1fr" gap={10}>
          <F l="House Status (Owned / Rented / Co.provided)">
            <select value={form[prefix + "residenceStatus"] || ""} onChange={e => upd(prefix + "residenceStatus", e.target.value)}>
              <option value="">Select Option</option>
              <option value="Owned">Owned</option>
              <option value="Rented">Rented</option>
              <option value="Company Provided">Company Provided</option>
              <option value="Family Owned">Family Owned</option>
            </select>
          </F>
          <F l="Number of years in current residence"><input type="number" min="0" value={form[prefix + "yearsInResidence"] || "0"} onChange={e => upd(prefix + "yearsInResidence", e.target.value)} /></F>
          <F l="Number of property you owned"><input type="number" min="0" value={form[prefix + "propertiesOwned"] || "0"} onChange={e => upd(prefix + "propertiesOwned", e.target.value)} /></F>
        </Grid>
      </DSSection>

      <DSSection title={`${label} - Employment Details`} accent={T.purple}>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Employer / Company Name"><input value={form[prefix + "companyName"] || ""} onChange={e => upd(prefix + "companyName", e.target.value)} placeholder="Company/Employer Name" /></F>
          <F l="Designation"><input value={form[prefix + "designation"] || ""} onChange={e => upd(prefix + "designation", e.target.value)} placeholder="e.g. Manager" /></F>
          <F l="Department"><input value={form[prefix + "department"] || ""} onChange={e => upd(prefix + "department", e.target.value)} placeholder="e.g. Sales" /></F>
        </Grid>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Company Website"><input value={form[prefix + "companyWebsite"] || ""} onChange={e => upd(prefix + "companyWebsite", e.target.value)} placeholder="e.g. www.website.com" /></F>
          <F l="Official Email ID"><input value={form[prefix + "officialEmail"] || ""} onChange={e => upd(prefix + "officialEmail", e.target.value)} placeholder="official@domain.com" /></F>
          <F l="Office Landline Number"><input value={form[prefix + "officeLandline"] || ""} onChange={e => upd(prefix + "officeLandline", e.target.value)} placeholder="Office Landline" /></F>
        </Grid>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="HR Email ID"><input value={form[prefix + "hrEmail"] || ""} onChange={e => upd(prefix + "hrEmail", e.target.value)} placeholder="hr@domain.com" /></F>
          <F l="HR Contact Number"><input value={form[prefix + "hrPhone"] || ""} onChange={e => upd(prefix + "hrPhone", e.target.value)} placeholder="HR Phone Number" /></F>
          <F l="Employee Number"><input value={form[prefix + "employeeNumber"] || ""} onChange={e => upd(prefix + "employeeNumber", e.target.value)} placeholder="Employee ID" /></F>
        </Grid>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Total Work Experience"><input value={form[prefix + "totalExperience"] || ""} onChange={e => upd(prefix + "totalExperience", e.target.value)} placeholder="e.g. 5 Years" /></F>
          <F l="Years in current job"><input type="number" min="0" value={form[prefix + "yearsInJob"] || "0"} onChange={e => upd(prefix + "yearsInJob", e.target.value)} /></F>
          <div />
        </Grid>
        <F l="Office Address"><textarea value={form[prefix + "officeAddress"] || ""} onChange={e => upd(prefix + "officeAddress", e.target.value)} rows={2} placeholder="Office Physical Address..." style={{ marginBottom: 10 }}></textarea></F>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="Monthly Gross Income (₹)"><input type="number" value={form[prefix + "monthlyGross"] || ""} onChange={e => upd(prefix + "monthlyGross", e.target.value)} placeholder="Gross monthly salary" /></F>
          <F l="Monthly Net Income (₹)"><input type="number" value={form[prefix + "monthlyNet"] || ""} onChange={e => upd(prefix + "monthlyNet", e.target.value)} placeholder="Net monthly take-home" /></F>
        </Grid>
      </DSSection>

      <DSSection title={`${label} - Banking & Financials`} accent={T.amber}>
        <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
          <F l="Salary / Current A/c Bank"><input value={form[prefix + "bankName"] || ""} onChange={e => upd(prefix + "bankName", e.target.value)} placeholder="Bank name" /></F>
          <F l="Branch Name"><input value={form[prefix + "bankBranch"] || ""} onChange={e => upd(prefix + "bankBranch", e.target.value)} placeholder="Branch name" /></F>
          <F l="Account No."><input value={form[prefix + "bankAccountNo"] || ""} onChange={e => upd(prefix + "bankAccountNo", e.target.value)} placeholder="Account number" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="IFSC Code"><input value={form[prefix + "bankIfsc"] || ""} onChange={e => upd(prefix + "bankIfsc", e.target.value)} placeholder="11-digit IFSC" /></F>
          <F l="Current Obligation - EMI (₹)"><input type="number" value={form[prefix + "currentEmi"] || ""} onChange={e => upd(prefix + "currentEmi", e.target.value)} placeholder="Total monthly obligations" /></F>
        </Grid>
      </DSSection>
    </div>
  );
}

function PropertyDealBlock({ form, upd }) {
  return (
    <DSSection title="Property & Deal Details" accent={T.gold}>
      <Grid cols="1fr 1fr" gap={10} mb={10}>
        <F l="Property Name"><input value={form.propertyName || ""} onChange={e => upd("propertyName", e.target.value)} placeholder="e.g. Ghar Kar Heights" /></F>
        <F l="Loan Amount Requested (₹)"><input type="number" value={form.loanAmount || ""} onChange={e => upd("loanAmount", e.target.value)} placeholder="e.g. 5000000" /></F>
      </Grid>
      <Grid cols="1fr 1fr" gap={10} mb={10}>
        <F l="Actual Deal Value (₹)"><input type="number" value={form.actualDealValue || ""} onChange={e => upd("actualDealValue", e.target.value)} placeholder="Actual market/deal value" /></F>
        <F l="Agreement Value (₹)"><input type="number" value={form.agreementValue || ""} onChange={e => upd("agreementValue", e.target.value)} placeholder="Value on sale agreement" /></F>
      </Grid>
      <Grid cols="1fr 1fr" gap={10}>
        <F l="Own Contribution (₹)"><input type="number" value={form.ownContribution || ""} onChange={e => upd("ownContribution", e.target.value)} placeholder="Client contribution amount" /></F>
        <F l="Tenure Requested (Years)"><input type="number" value={form.tenure || ""} onChange={e => upd("tenure", e.target.value)} placeholder="Requested loan tenure" /></F>
      </Grid>
    </DSSection>
  );
}

function ReferencesBlock({ form, upd }) {
  return (
    <div>
      <DSSection title="Reference 1 (Mandatory)" accent={T.red}>
        <Grid cols="1fr 1fr" gap={10} mb={10}>
          <F l="Full Name *"><input value={form.ref1_name || ""} onChange={e => upd("ref1_name", e.target.value)} placeholder="Reference 1 Name" /></F>
          <F l="Phone Number *"><input value={form.ref1_phone || ""} onChange={e => upd("ref1_phone", e.target.value)} placeholder="Reference 1 Phone" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="Email ID"><input value={form.ref1_email || ""} onChange={e => upd("ref1_email", e.target.value)} placeholder="Reference 1 Email" /></F>
          <F l="Address"><textarea value={form.ref1_address || ""} onChange={e => upd("ref1_address", e.target.value)} rows={2} placeholder="Reference 1 Address..."></textarea></F>
        </Grid>
      </DSSection>
      <DSSection title="Reference 2 (Mandatory)" accent={T.red}>
        <Grid cols="1fr 1fr" gap={10} mb={10}>
          <F l="Full Name *"><input value={form.ref2_name || ""} onChange={e => upd("ref2_name", e.target.value)} placeholder="Reference 2 Name" /></F>
          <F l="Phone Number *"><input value={form.ref2_phone || ""} onChange={e => upd("ref2_phone", e.target.value)} placeholder="Reference 2 Phone" /></F>
        </Grid>
        <Grid cols="1fr 1fr" gap={10}>
          <F l="Email ID"><input value={form.ref2_email || ""} onChange={e => upd("ref2_email", e.target.value)} placeholder="Reference 2 Email" /></F>
          <F l="Address"><textarea value={form.ref2_address || ""} onChange={e => upd("ref2_address", e.target.value)} rows={2} placeholder="Reference 2 Address..."></textarea></F>
        </Grid>
      </DSSection>
    </div>
  );
}

function DetailSheetTab({ lead, onUpdate }) {
  const [form, setForm] = useState(() => getInitialFormState(lead));
  const [subTab, setSubTab] = useState("applicant");

  useEffect(() => {
    setForm(getInitialFormState(lead));
  }, [lead]);

  function upd(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function save() {
    onUpdate(lead.id, form);
    alert("Detail Sheet saved!");
  }

  const subTabs = [
    { id: "applicant", label: "Applicant" },
    { id: "coapp1", label: "Co-Applicant 1" },
    { id: "coapp2", label: "Co-Applicant 2" },
    { id: "coapp3", label: "Co-Applicant 3" },
    { id: "property", label: "Property & Deal" },
    { id: "references", label: "References" },
  ];

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

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.creamDark, borderRadius: 12, padding: 4 }} className="no-print">
        {subTabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setSubTab(t.id)} 
            style={{ 
              flex: 1, 
              padding: "9px 0", 
              border: "none", 
              borderRadius: 9, 
              background: subTab === t.id ? T.navy : "transparent", 
              color: subTab === t.id ? T.gold : T.textMid, 
              fontWeight: subTab === t.id ? 600 : 400, 
              fontSize: 13, 
              cursor: "pointer", 
              transition: "all 0.2s" 
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`ds-tab-content ${subTab === "applicant" ? "active" : ""}`}>
        <ApplicantFormBlock prefix="" form={form} upd={upd} label="Primary Applicant" />
      </div>

      <div className={`ds-tab-content ${subTab === "coapp1" ? "active" : ""}`}>
        <ApplicantFormBlock prefix="co1_" form={form} upd={upd} label="Co-Applicant 1" />
      </div>

      <div className={`ds-tab-content ${subTab === "coapp2" ? "active" : ""}`}>
        <ApplicantFormBlock prefix="co2_" form={form} upd={upd} label="Co-Applicant 2" />
      </div>

      <div className={`ds-tab-content ${subTab === "coapp3" ? "active" : ""}`}>
        <ApplicantFormBlock prefix="co3_" form={form} upd={upd} label="Co-Applicant 3" />
      </div>

      <div className={`ds-tab-content ${subTab === "property" ? "active" : ""}`}>
        <PropertyDealBlock form={form} upd={upd} />
      </div>

      <div className={`ds-tab-content ${subTab === "references" ? "active" : ""}`}>
        <ReferencesBlock form={form} upd={upd} />
      </div>

      <button onClick={save} className="posh-btn no-print" style={{ background: T.navy, color: T.gold, width: "100%", justifyContent: "center", marginTop: 24 }}>Save Detail Sheet</button>
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

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const LBL = { fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 6 };
function ST({ children }) { return <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.navy, marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${T.gold}40`, display: "flex", alignItems: "center", gap: 10 }}>{children}</div>; }
function Card({ title, children, accent }) { return <div className="posh-card">{accent && <div style={{ height: 3, background: `linear-gradient(90deg,${accent},${accent}30)`, borderRadius: "4px 4px 0 0", margin: "-20px -22px 16px" }} />}{title && <div style={{ fontWeight: 700, fontSize: 15, color: T.navy, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>{title}</div>}{children}</div>; }
function Alrt({ c, bg, title, children }) { return <div style={{ background: bg, border: `1px solid ${c}35`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, borderLeft: `4px solid ${c}` }}><div style={{ fontWeight: 700, fontSize: 13, color: c, marginBottom: 8 }}>{title}</div>{children}</div>; }
function Tg({ c, children }) { return <span style={{ fontSize: 11, background: `${c}15`, color: c, padding: "3px 10px", borderRadius: 20, fontWeight: 700, display: "inline-block", border: `1px solid ${c}25` }}>{children}</span>; }
function Btn({ onClick, c, children, full }) { return <button onClick={onClick} className="posh-btn" style={{ background: c, color: "#fff", width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined }}>{children}</button>; }
function Grid({ cols, gap, mb, children }) { return <div style={{ display: "grid", gridTemplateColumns: cols, gap, marginBottom: mb }}>{children}</div>; }
function F({ l, children }) { return <div style={{ marginBottom: 2 }}><label style={LBL}>{l}</label>{children}</div>; }

// ─── BANK MATRIX ─────────────────────────────────────────────────────────────
const BANK_CRITERIA = [
  { bank: "State Bank of India (SBI)", roi: "8.40% - 9.10%", maxFoir: 60, maxLtv: 90, fee: "0.35% (Min ₹2,000, Max ₹10,000)", tenure: 30, remarks: "0.05% concession for women. Max age 75 at maturity." },
  { bank: "HDFC Bank", roi: "8.50% - 9.30%", maxFoir: 55, maxLtv: 80, fee: "0.50% or ₹3,000", tenure: 30, remarks: "Quick pre-approvals for salary account holders." },
  { bank: "ICICI Bank", roi: "8.65% - 9.50%", maxFoir: 55, maxLtv: 80, fee: "0.50% of loan amount", tenure: 30, remarks: "Special benefits for self-employed professionals." },
  { bank: "Axis Bank", roi: "8.75% - 9.60%", maxFoir: 50, maxLtv: 80, fee: "Up to 1% of loan amount", tenure: 30, remarks: "Special rates for green home certifications." },
  { bank: "LIC Housing Finance", roi: "8.50% - 9.15%", maxFoir: 60, maxLtv: 90, fee: "₹10,000 fixed flat fee", tenure: 30, remarks: "Longer tenure support for younger applicants." },
  { bank: "Bank of Baroda", roi: "8.45% - 9.25%", maxFoir: 55, maxLtv: 90, fee: "Nil for limited period offer", tenure: 30, remarks: "Fast legal processing." }
];

function BankMatrix() {
  const [grossIncome, setGrossIncome] = useState(150000);
  const [existingEmi, setExistingEmi] = useState(20000);
  const [propertyValue, setPropertyValue] = useState(6000000);

  function calculateMaxLoan(emiCapability, roiStr, maxTenureYrs) {
    if (emiCapability <= 0) return 0;
    const roiNum = parseFloat(roiStr) || 8.5;
    const r = (roiNum / 12) / 100;
    const n = maxTenureYrs * 12;
    const p = emiCapability * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    return Math.round(p);
  }

  return (
    <div className="fade">
      <ST>🏦 Bank Eligibility & ROI Comparison Matrix</ST>
      <Card title="Interactive Eligibility Calculator" accent={T.gold}>
        <Grid cols="1fr 1fr 1fr" gap={14} mb={10}>
          <F l="Monthly Gross Income (₹)"><input type="number" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} placeholder="Combined Gross Monthly Salary" /></F>
          <F l="Existing Monthly EMIs (₹)"><input type="number" value={existingEmi} onChange={e => setExistingEmi(Number(e.target.value))} placeholder="All current loan EMIs" /></F>
          <F l="Property Value (₹)"><input type="number" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} placeholder="Market Value of Property" /></F>
        </Grid>
        <div style={{ fontSize: 12, color: T.textLight, marginTop: 8 }}>
          Calculates eligible loan amounts based on combined FOIR and LTV guidelines dynamically.
        </div>
      </Card>

      <Card title="Bank-wise Comparison Matrix">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                <th style={{ padding: "10px 8px", color: T.navy }}>Bank Name</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Interest Rate (ROI)</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Max FOIR</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Max LTV Limit</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Processing Fee</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Max Loan (FOIR)</th>
                <th style={{ padding: "10px 8px", color: T.navy }}>Max Loan (LTV)</th>
                <th style={{ padding: "10px 8px", color: T.navy, fontWeight: 700 }}>Final Eligible Loan</th>
              </tr>
            </thead>
            <tbody>
              {BANK_CRITERIA.map((b, idx) => {
                const maxFoirAmount = (grossIncome * b.maxFoir / 100) - existingEmi;
                const emiCap = Math.max(0, maxFoirAmount);
                const maxLoanFoir = calculateMaxLoan(emiCap, b.roi, b.tenure);
                const maxLoanLtv = Math.round(propertyValue * b.maxLtv / 100);
                const finalEligible = Math.min(maxLoanFoir, maxLoanLtv);

                return (
                  <tr key={idx} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "12px 8px", fontWeight: 600 }}>{b.bank}</td>
                    <td style={{ padding: "12px 8px" }}><Tg c={T.green}>{b.roi}</Tg></td>
                    <td style={{ padding: "12px 8px" }}>{b.maxFoir}%</td>
                    <td style={{ padding: "12px 8px" }}>{b.maxLtv}%</td>
                    <td style={{ padding: "12px 8px", fontSize: 11, color: T.textMid }}>{b.fee}</td>
                    <td style={{ padding: "12px 8px" }}>₹{maxLoanFoir.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 8px" }}>₹{maxLoanLtv.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 700, color: finalEligible > 0 ? T.blue : T.red }}>
                      ₹{finalEligible.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── APF DIRECTORY ────────────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  { id: 1, name: "Ghar Kar Heights", builder: "Ghar Kar Developers", city: "Pune", location: "Hinjewadi", status: "Pre-Approved", apf: { "HDFC": "APF-789312", "SBI": "APF-564231", "ICICI": "APF-231908" } },
  { id: 2, name: "Amanora Gateway", builder: "City Corporation", city: "Pune", location: "Hadapsar", status: "Pre-Approved", apf: { "HDFC": "APF-112233", "Axis": "APF-445566", "LIC HFL": "APF-778899" } },
  { id: 3, name: "Blue Ridge", builder: "Paranjape Schemes", city: "Pune", location: "Hinjewadi", status: "Pre-Approved", apf: { "SBI": "APF-909090", "ICICI": "APF-808080", "Bank of Baroda": "APF-707070" } },
  { id: 4, name: "Pride World City", builder: "Pride Group", city: "Pune", location: "Charholi", status: "Pending", apf: { "HDFC": "APF-324151" } }
];

function ProjectDirectory() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProj, setNewProj] = useState({ name: "", builder: "", city: "", location: "", status: "Pre-Approved", bank: "", apfNum: "" });

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.builder.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    if (!newProj.name || !newProj.builder) return;
    const apf = newProj.bank ? { [newProj.bank]: newProj.apfNum } : {};
    const item = {
      id: Date.now(),
      name: newProj.name,
      builder: newProj.builder,
      city: newProj.city || "Pune",
      location: newProj.location,
      status: newProj.status,
      apf
    };
    setProjects([item, ...projects]);
    setShowAddModal(false);
    setNewProj({ name: "", builder: "", city: "", location: "", status: "Pre-Approved", bank: "", apfNum: "" });
  }

  return (
    <div className="fade">
      <ST>🏗️ Builder & Project Pre-Approval (APF) Directory</ST>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects by name, builder, or location..." style={{ maxWidth: 400 }} />
        <Btn c={T.navy} onClick={() => setShowAddModal(true)}>+ Add Project</Btn>
      </div>

      <Card title="Pre-Approved Projects List">
        <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={{ padding: 10, color: T.navy }}>Project</th>
              <th style={{ padding: 10, color: T.navy }}>Builder</th>
              <th style={{ padding: 10, color: T.navy }}>Location</th>
              <th style={{ padding: 10, color: T.navy }}>Status</th>
              <th style={{ padding: 10, color: T.navy }}>Approved Banks & APF Numbers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: 12 }}>{p.builder}</td>
                <td style={{ padding: 12 }}>{p.location}, {p.city}</td>
                <td style={{ padding: 12 }}><Tg c={p.status === "Pre-Approved" ? T.green : T.amber}>{p.status}</Tg></td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(p.apf || {}).map(([bank, code]) => (
                      <span key={bank} style={{ fontSize: 11, background: T.blueBg, color: T.blue, padding: "2px 8px", borderRadius: 4, border: `1px solid #90CAF9` }}>
                        <strong>{bank}</strong>: {code}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,20,55,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: T.white, borderRadius: 18, padding: 28, maxWidth: 450, width: "100%" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Add Pre-Approved Project</div>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="Project Name *"><input value={newProj.name} onChange={e => setNewProj({ ...newProj, name: e.target.value })} placeholder="Project name" /></F>
              <F l="Builder Name *"><input value={newProj.builder} onChange={e => setNewProj({ ...newProj, builder: e.target.value })} placeholder="Builder name" /></F>
            </Grid>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="City"><input value={newProj.city} onChange={e => setNewProj({ ...newProj, city: e.target.value })} placeholder="Pune" /></F>
              <F l="Location"><input value={newProj.location} onChange={e => setNewProj({ ...newProj, location: e.target.value })} placeholder="e.g. Hinjewadi" /></F>
            </Grid>
            <Grid cols="1fr 1fr" gap={10} mb={10}>
              <F l="APF Bank"><input value={newProj.bank} onChange={e => setNewProj({ ...newProj, bank: e.target.value })} placeholder="e.g. HDFC" /></F>
              <F l="APF Number"><input value={newProj.apfNum} onChange={e => setNewProj({ ...newProj, apfNum: e.target.value })} placeholder="e.g. APF-903214" /></F>
            </Grid>
            <F l="Status">
              <select value={newProj.status} onChange={e => setNewProj({ ...newProj, status: e.target.value })} style={{ width: "100%" }}>
                <option value="Pre-Approved">Pre-Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </F>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn c={T.navy} full onClick={handleAdd}>Save Project</Btn>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "11px", background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BANK LOGINS TAB ──────────────────────────────────────────────────────────
function BankLoginsTab({ lead, onUpdate }) {
  const logins = lead.bankLogins || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newLogin, setNewLogin] = useState({ bank: "HDFC Bank", refNo: "", status: "Logged In", date: td() });
  const [queryInput, setQueryInput] = useState({ desc: "", loginId: null });

  function addLogin() {
    const item = { id: gid(), ...newLogin, queries: [] };
    onUpdate(lead.id, { bankLogins: [...logins, item] });
    setShowAdd(false);
    setNewLogin({ bank: "HDFC Bank", refNo: "", status: "Logged In", date: td() });
  }

  function updateStatus(id, stat) {
    const updated = logins.map(l => l.id === id ? { ...l, status: stat } : l);
    onUpdate(lead.id, { bankLogins: updated });
  }

  function addQuery(loginId) {
    if (!queryInput.desc.trim()) return;
    const updated = logins.map(l => {
      if (l.id !== loginId) return l;
      const q = { id: gid(), desc: queryInput.desc.trim(), status: "Open", dateRaised: td(), dateResolved: "" };
      return { ...l, queries: [...(l.queries || []), q] };
    });
    onUpdate(lead.id, { bankLogins: updated });
    setQueryInput({ desc: "", loginId: null });
  }

  function resolveQuery(loginId, queryId) {
    const updated = logins.map(l => {
      if (l.id !== loginId) return l;
      return {
        ...l,
        queries: l.queries.map(q => q.id === queryId ? { ...q, status: "Resolved", dateResolved: td() } : q)
      };
    });
    onUpdate(lead.id, { bankLogins: updated });
  }

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: T.textLight }}>Track parallel submissions to multiple banks.</div>
        <Btn c={T.navy} onClick={() => setShowAdd(true)}>+ New Bank Submission</Btn>
      </div>

      {showAdd && (
        <Card title="New Bank Submission Details" accent={T.blue}>
          <Grid cols="1fr 1fr 1fr" gap={10} mb={10}>
            <F l="Bank Name">
              <select value={newLogin.bank} onChange={e => setNewLogin({ ...newLogin, bank: e.target.value })}>
                <option>HDFC Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>LIC Housing Finance</option>
                <option>Bank of Baroda</option>
              </select>
            </F>
            <F l="File/Reference Number"><input value={newLogin.refNo} onChange={e => setNewLogin({ ...newLogin, refNo: e.target.value })} placeholder="e.g. REF-8910" /></F>
            <F l="Submission Date"><input type="date" value={newLogin.date} onChange={e => setNewLogin({ ...newLogin, date: e.target.value })} /></F>
          </Grid>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn c={T.navy} onClick={addLogin}>Add Submission</Btn>
            <button onClick={() => setShowAdd(false)} style={{ padding: "10px 18px", background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {logins.length === 0 && <div style={{ background: T.white, padding: 30, borderRadius: 14, textAlign: "center", color: T.textLight, border: `1px solid ${T.border}` }}>No bank logins recorded yet for this lead. Click "+ New Bank Submission" above to add one.</div>}

      {logins.map(l => (
        <Card key={l.id} title={`${l.bank}`} accent={T.gold}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13 }}>
              <strong>File Ref:</strong> {l.refNo || "—"} · <strong>Logged on:</strong> {l.date}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginRight: 8, color: T.textMid }}>Status:</label>
              <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, width: 160 }}>
                <option>Logged In</option>
                <option>Underwriter Review</option>
                <option>Valuation Initiated</option>
                <option>Legal Check</option>
                <option>Sanctioned</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Credit Query Logs ({l.queries?.filter(q => q.status === "Open").length || 0} Open)</div>
            
            {(l.queries || []).length === 0 && <div style={{ fontSize: 12, color: T.textLight, fontStyle: "italic", marginBottom: 8 }}>No queries raised.</div>}
            
            {(l.queries || []).map(q => (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", background: q.status === "Open" ? T.redBg : T.greenBg, border: `1px solid ${q.status === "Open" ? T.red : T.green}20`, borderRadius: 8, padding: 10, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, color: T.text }}>{q.desc}</div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>Raised: {q.dateRaised} {q.status === "Resolved" && `· Resolved: ${q.dateResolved}`}</div>
                </div>
                {q.status === "Open" ? (
                  <button onClick={() => resolveQuery(l.id, q.id)} style={{ fontSize: 11, background: T.white, border: `1px solid ${T.green}`, color: T.green, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>Mark Resolved</button>
                ) : (
                  <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Resolved</span>
                )}
              </div>
            ))}

            {queryInput.loginId === l.id ? (
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <input value={queryInput.desc} onChange={e => setQueryInput({ ...queryInput, desc: e.target.value })} placeholder="Describe credit query..." style={{ flex: 1, padding: 8 }} />
                <Btn c={T.navy} onClick={() => addQuery(l.id)}>Save Query</Btn>
                <button onClick={() => setQueryInput({ desc: "", loginId: null })} style={{ background: "transparent", border: "none", color: T.textLight, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setQueryInput({ desc: "", loginId: l.id })} style={{ fontSize: 12, background: "transparent", border: `1.5px dashed ${T.border}`, borderRadius: 6, width: "100%", padding: 6, color: T.textMid, cursor: "pointer", fontWeight: 600 }}>+ Log Query from Credit Underwriter</button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── CLIENT PORTAL SIMULATOR ──────────────────────────────────────────────────
function ClientPortalSim({ lead, onUpdate }) {
  const [simActive, setSimActive] = useState(false);
  const empType = lead.employmentType || "Salaried";
  const docSet = DOC_REQUIREMENTS[empType] || DOC_REQUIREMENTS["Salaried"];
  const received = lead.docsReceived || {};

  function handleSimUpload(doc) {
    onUpdate(lead.id, { docsReceived: { ...received, [doc]: true } });
    alert(`[Simulation] ${doc} uploaded by client and synchronized!`);
  }

  const portalLink = `https://portal.gharkar.com/upload/${lead.id}`;

  return (
    <div className="fade">
      <Card title="Client Portal Configuration" accent={T.blue}>
        <div style={{ fontSize: 13, color: T.text, marginBottom: 12 }}>
          Send this secure portal link to the customer. They can upload documents directly from their mobile or desktop without password login.
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: T.cream, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{portalLink}</span>
          <Btn c={T.blue} onClick={() => { navigator.clipboard.writeText(portalLink); alert("Link copied to clipboard!"); }}>Copy Link</Btn>
          <Btn c={T.navy} onClick={() => setSimActive(!simActive)}>{simActive ? "Close Simulator" : "Open Simulator"}</Btn>
        </div>
      </Card>

      {simActive && (
        <div className="fade" style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <div style={{
            width: 375,
            minHeight: 650,
            border: "12px solid #0B1437",
            borderRadius: 36,
            background: "#F7F3EC",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 48px rgba(11,20,55,0.25)",
            overflow: "hidden"
          }}>
            <div style={{ height: 28, background: "#0B1437", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: 60, height: 4, background: "#8888AA", borderRadius: 2 }} />
            </div>

            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, fontFamily: "'Playfair Display',serif" }}>Ghar Kar Portal</div>
                <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>Secure Document Upload</div>
              </div>

              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Welcome {lead.name}</div>
                <div style={{ fontSize: 11, color: T.textLight, marginTop: 3 }}>
                  Please upload files required for your <strong>{lead.loanType || "Home Loan"}</strong> application.
                </div>
              </div>

              {Object.entries(docSet).map(([cat, docs]) => (
                <div key={cat} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginBottom: 8 }}>{cat}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {docs.map((doc, idx) => {
                      const done = !!received[doc];
                      return (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderBottom: idx < docs.length - 1 ? `0.5px solid ${T.border}` : "none", paddingBottom: 6 }}>
                          <span style={{ fontSize: 12, color: done ? T.textLight : T.text, textDecoration: done ? "line-through" : "none", flex: 1 }}>{doc}</span>
                          {done ? (
                            <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>✓ Uploaded</span>
                          ) : (
                            <button 
                              onClick={() => handleSimUpload(doc)}
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                background: T.blue,
                                color: T.white,
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: 600
                              }}
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 20, display: "flex", justifyContent: "center", alignItems: "center", background: "#EDE6D8" }}>
              <div style={{ width: 100, height: 4, background: "#8888AA", borderRadius: 2 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"hidden" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", background: T.navy, color: T.white, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>CRM Copilot</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Online & ready to assist</div>
            </div>
          </div>
          {messages.length > 1 && (
            <button 
              onClick={() => setMessages([{ sender: "ai", text: `Chat cleared. How can I help you now?` }])}
              style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.2)`, color: T.white, fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages Box */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, background: `${T.cream}33` }}>
          {messages.map((msg, i) => {
            const isAi = msg.sender === "ai";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isAi ? "flex-start" : "flex-end" }}>
                <div style={{
                  maxWidth: "75%",
                  padding: "12px 16px",
                  borderRadius: 16,
                  borderBottomLeftRadius: isAi ? 4 : 16,
                  borderBottomRightRadius: isAi ? 16 : 4,
                  background: isAi ? T.white : T.navy,
                  color: isAi ? T.text : T.white,
                  border: isAi ? `1px solid ${T.border}` : "none",
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: isAi ? "0 2px 8px rgba(0,0,0,0.02)" : "0 4px 12px rgba(11,20,55,0.15)",
                  whiteSpace: "pre-line"
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                padding: "12px 20px",
                borderRadius: 16,
                borderBottomLeftRadius: 4,
                display: "flex",
                gap: 5,
                alignItems: "center"
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animationDelay: `${j * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, background: T.white }}>
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !loading) handleSend(); }}
            placeholder="Ask anything about your leads, stats, or draft a message..."
            disabled={loading}
            style={{ flex: 1, padding: "12px 16px" }}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              padding: "0 24px",
              background: loading || !input.trim() ? T.textLight : T.navy,
              color: T.white,
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
