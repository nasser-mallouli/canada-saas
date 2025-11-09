from ninja import Router
from typing import Optional, List
from pydantic import BaseModel
from django.conf import settings
from ninja.errors import HttpError
from ninja_jwt.authentication import JWTAuth
import requests
import json
from apps.ai_provider.utils import (
    markdown_to_pdf,
    generate_pdf_filename,
    get_pdf_storage_path,
    get_pdf_url
)
from apps.core.models import ImmigrationReport

router = Router(tags=["AI Provider"])

# System Prompt Template
SYSTEM_PROMPT = """You are a **senior Canadian Immigration Consultant (RCIC)** with 15+ years of experience. You write **direct, actionable, expert-level reports** that get straight to the point. No fluff, no generic praise, no filler—only useful, specific information.

**CRITICAL RULES:**
- **NEVER use placeholder language** like "scores to be confirmed" or "appears to be placeholder data"—work with the data provided
- **NO generic praise** ("excellent position", "significant achievement")—be factual and specific
- **NO repetition**—each sentence must add new value
- **Be direct and actionable**—tell them exactly what to do, when, and why
- **Focus on specifics**—use actual numbers, dates, and concrete steps
- **ALWAYS generate complete content**—never return empty responses

---

### 🧾 OUTPUT STRUCTURE (Markdown)

Your answer **must** use the following structure and style. Write naturally, as if you personally reviewed their file:

---

# 🇨🇦 Immigration Eligibility & Guidance Report

## 👤 Profile Summary

Provide a **concise, factual summary** (2-3 sentences max). State their age, education, experience, current CRS score (if applicable), and primary pathway. No fluff.

**Example:**
> "[Name], age [X], holds a [degree] with [Y] years of [Canadian/foreign] work experience. Current CRS: [score] points. Primary pathway: [Express Entry/PNP/Study Visa/etc.]."

---

## 🏁 Eligibility Analysis

**Be specific and factual.** Break down their eligibility with actual numbers and requirements:

**For Express Entry:**
- CRS breakdown: Age ([X] points), Education ([Y] points), Experience ([Z] points), Language ([W] points), Additional factors ([V] points) = Total: [score]
- Recent draw cut-off range: [X-Y] points (cite if known, otherwise state "typically [range]")
- Assessment: [Eligible/Not eligible/Needs improvement] - [specific reason]

**For other pathways:** List each requirement and their status:
- [Requirement 1]: ✅ Met / ❌ Not met - [specific gap]
- [Requirement 2]: ✅ Met / ❌ Not met - [specific gap]

**NO generic statements.** Every point must be specific and useful.

---

## 💡 Improvement Roadmap

**List only actionable steps that will actually improve their situation.** If they're already eligible, focus on optimization and next steps.

**Format as a Markdown table. Each row must be on a separate line with proper pipe syntax:**

| Action | Current Status | Required Action | Impact | Timeline | Cost |
|--------|---------------|-----------------|--------|----------|------|
| Language test | CLB [X] | Retake to achieve CLB [Y] | +[Z] points | [timeframe] | $[amount] |
| ECA assessment | [Status] | [Specific action] | [Impact] | [timeframe] | $[amount] |

**CRITICAL TABLE FORMATTING RULES:**
- Each row MUST be on a separate line (no rows concatenated on same line)
- Start AND end each row with a pipe character (|)
- Use actual values from their profile, NOT placeholders - replace [X], [Status], [timeframe], [amount] with real data
- Each row must have exactly 6 columns matching the header
- NO empty cells - use "N/A" or "Not applicable" if needed
- Keep cell content concise (max 50 characters per cell)
- Only include steps that are actually needed and have measurable impact
- The separator row (with dashes) must be on its own line between header and data rows
- Ensure proper spacing - one space after each pipe, content aligned properly

---

## 🧭 Recommended Pathway

**Provide a clear, chronological timeline with specific actions and deadlines.**

**Format:**
**Phase 1: [Month range] - [Action]**
- [Specific task 1] - Deadline: [date/timeline]
- [Specific task 2] - Deadline: [date/timeline]

**Phase 2: [Month range] - [Action]**
- [Specific task 1] - Deadline: [date/timeline]
- [Specific task 2] - Deadline: [date/timeline]

**Phase 3: [Month range] - [Action]**
- [Specific task 1] - Deadline: [date/timeline]

**Expected Timeline to PR:** [X] months from [start point]

If multiple pathways are viable, list them with **specific pros/cons and timelines**:
- **Pathway A:** [Name] - Pros: [specific], Cons: [specific], Timeline: [X] months
- **Pathway B:** [Name] - Pros: [specific], Cons: [specific], Timeline: [Y] months

---

## 🧑‍💼 Professional Recommendations

**Provide direct, actionable next steps with specific deadlines and requirements.**

**Immediate Actions (This Week):**
1. [Specific action] - [Why it's urgent] - Deadline: [date]
2. [Specific action] - [Why it's urgent] - Deadline: [date]

**Short-term (Next 30 Days):**
1. [Specific action] - Required documents: [list], Cost: $[amount], Timeline: [timeframe]
2. [Specific action] - Required documents: [list], Cost: $[amount], Timeline: [timeframe]

**Medium-term (Next 3-6 Months):**
1. [Specific action] - [Key details]
2. [Specific action] - [Key details]

**Important Notes:**
- [Specific warning or critical information]
- [Common mistake to avoid]
- [Resource or contact information if relevant]

**NO generic motivational statements.** End with specific next steps or critical reminders only.

---

### ⚙️ Tone and Style Requirements

- **Write like an expert consultant**—direct, professional, no fluff
- **Be specific and factual**—use actual numbers, dates, and concrete information
- **NO generic praise or filler**—every sentence must provide value
- **NO repetition**—don't say the same thing twice
- **Use active voice** and be direct
- **Work with the data provided**—never say "placeholder" or "to be confirmed"
- Use emojis only in section headers for visual organization
- **Be confident and specific**—avoid "might", "could", "appears to be"
- **Length: 400-800 words**—comprehensive but concise
- **Focus on actionable information**—what they need to know, what they need to do

---

### ⚠️ Critical Rules

- **ALWAYS generate complete content**—never return empty responses
- **Always write in Markdown format** with proper headers, lists, and tables
- **Never hallucinate**—use only IRCC-official rules and logic
- **NO generic statements**—every sentence must be specific to their profile
- **NO filler or fluff**—remove any sentence that doesn't add actionable value
- **Include specific numbers** (CRS scores, timelines, point breakdowns, costs) when applicable
- **Work with provided data**—never dismiss data as "placeholder" or "to be confirmed"
- **Be direct and actionable**—tell them exactly what to do, when, and why
- **NO repetition**—each piece of information should appear only once
- **Focus on useful information**—what they need to know to take action

**Remember: This is an expert consultation report. Every word must be useful, specific, and actionable. No fluff, no generic praise, no filler.**"""


class ImmigrationProfileSchema(BaseModel):
    """Schema for immigration profile input"""
    # User Information (optional for anonymous users)
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    
    # Goal Path
    path: str  # Study Visa, Work Permit, Express Entry, PNP, Quebec PR, Citizenship
    
    # Personal Information
    age: Optional[int] = None
    marital_status: Optional[str] = None
    citizenship: Optional[str] = None
    residence_country: Optional[str] = None
    
    # Education
    highest_degree: Optional[str] = None
    field_of_study: Optional[str] = None
    canadian_credential: Optional[str] = None
    eca_completed: Optional[str] = None
    
    # Language Proficiency
    english_test: Optional[str] = None
    english_scores: Optional[str] = None  # Format: "L/R/W/S" or "CLB X"
    french_test: Optional[str] = None
    french_scores: Optional[str] = None
    
    # Work Experience
    foreign_experience_years: Optional[int] = None
    canadian_experience_years: Optional[int] = None
    occupation_noc: Optional[str] = None
    
    # Proof of Funds
    funds: Optional[str] = None  # CAD amount
    
    # Family and Relatives
    spouse: Optional[str] = None
    sibling_in_canada: Optional[str] = None
    relative_in_canada: Optional[str] = None
    
    # Additional Notes
    user_notes: Optional[str] = None


class ImmigrationReportResponse(BaseModel):
    """Schema for immigration report response"""
    id: str  # Report ID
    report: str  # Markdown formatted report
    pdf_filename: Optional[str] = None  # PDF filename (optional if PDF generation fails)
    pdf_url: Optional[str] = None  # URL to access the PDF file (optional if PDF generation fails)
    pdf_path: Optional[str] = None  # Full path to the PDF file (optional if PDF generation fails)
    created_at: str  # Creation timestamp


def build_user_prompt(profile: ImmigrationProfileSchema) -> str:
    """Build the user prompt from profile data"""
    prompt = """# 🧍 User Immigration Profile

**Goal Path:** {path}  

*(Choose one: Study Visa, Work Permit, Express Entry, PNP, Quebec PR, Citizenship)*

---

## 👤 Personal Information

- **Age:** {age}

- **Marital Status:** {marital_status}

- **Citizenship:** {citizenship}

- **Current Country of Residence:** {residence_country}

---

## 🎓 Education

- **Highest Degree:** {highest_degree}

- **Field of Study:** {field_of_study}

- **Canadian Credential:** {canadian_credential}

- **ECA Completed:** {eca_completed}

---

## 🗣️ Language Proficiency

- **English Test:** {english_test}

- **Scores (L/R/W/S):** {english_scores}

- **French Test:** {french_test}

- **Scores (if any):** {french_scores}

---

## 💼 Work Experience

- **Foreign Experience (years):** {foreign_experience_years}

- **Canadian Experience (years):** {canadian_experience_years}

- **Occupation / NOC Code:** {occupation_noc}

---

## 💰 Proof of Funds

- **Available Settlement Funds (CAD):** {funds}

---

## 👪 Family and Relatives

- **Spouse Accompanying:** {spouse}

- **Sibling in Canada:** {sibling_in_canada}

- **Other Relatives in Canada:** {relative_in_canada}

---

## 🧭 Additional Notes

{user_notes}

---

# 🧩 Task

Analyze the profile above according to IRCC's official rules for the selected pathway.

Then produce a **complete Markdown report** in the format defined in your system prompt.

The report must include:

- Profile summary  

- Eligibility status  

- CRS breakdown (if applicable)  

- Improvement roadmap  

- Step-by-step recommended pathway  

- Professional consultant advice  

- Motivational closing paragraph
""".format(
        path=profile.path or "Not specified",
        age=profile.age or "Not specified",
        marital_status=profile.marital_status or "Not specified",
        citizenship=profile.citizenship or "Not specified",
        residence_country=profile.residence_country or "Not specified",
        highest_degree=profile.highest_degree or "Not specified",
        field_of_study=profile.field_of_study or "Not specified",
        canadian_credential=profile.canadian_credential or "Not specified",
        eca_completed=profile.eca_completed or "Not specified",
        english_test=profile.english_test or "Not specified",
        english_scores=profile.english_scores or "Not specified",
        french_test=profile.french_test or "Not specified",
        french_scores=profile.french_scores or "Not specified",
        foreign_experience_years=profile.foreign_experience_years or "Not specified",
        canadian_experience_years=profile.canadian_experience_years or "Not specified",
        occupation_noc=profile.occupation_noc or "Not specified",
        funds=profile.funds or "Not specified",
        spouse=profile.spouse or "Not specified",
        sibling_in_canada=profile.sibling_in_canada or "Not specified",
        relative_in_canada=profile.relative_in_canada or "Not specified",
        user_notes=profile.user_notes or "None"
    )
    return prompt


@router.post("/generate-report", response=ImmigrationReportResponse, auth=None)
def generate_immigration_report(request, payload: ImmigrationProfileSchema):
    """
    Generate an immigration eligibility report using OpenRouter API.
    Accepts user profile data and returns a structured Markdown report.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    print("=" * 80)
    print("AI PROVIDER: Starting report generation")
    print("=" * 80)
    
    # Check if API key is configured
    if not settings.OPENROUTER_API_KEY:
        print("ERROR: OpenRouter API key is not configured!")
        raise HttpError(
            500,
            "OpenRouter API key is not configured. Please set OPENROUTER_API1 or OPENROUTER_API_KEY in your environment variables (.env file) and restart the Django server."
        )
    
    print(f"✓ API Key configured (length: {len(settings.OPENROUTER_API_KEY)})")
    print(f"✓ Using model: {settings.OPENROUTER_MODEL}")
    print(f"✓ API URL: {settings.OPENROUTER_BASE_URL}")
    
    # Log incoming request
    print("\n" + "-" * 80)
    print("INCOMING REQUEST:")
    print("-" * 80)
    print(f"User: {payload.user_name} ({payload.user_email})")
    print(f"Pathway: {payload.path}")
    print(f"Age: {payload.age}")
    print(f"Education: {payload.highest_degree}")
    print(f"English Scores: {payload.english_scores}")
    print(f"Canadian Experience: {payload.canadian_experience_years} years")
    print(f"Foreign Experience: {payload.foreign_experience_years} years")
    print(f"User Notes: {payload.user_notes}")
    print("-" * 80)
    
    # Build user prompt from profile
    print("\nBuilding user prompt from profile...")
    user_prompt = build_user_prompt(payload)
    print(f"✓ User prompt built (length: {len(user_prompt)} characters)")
    print(f"✓ System prompt length: {len(SYSTEM_PROMPT)} characters")
    
    # Prepare OpenRouter API request
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": request.build_absolute_uri('/') if hasattr(request, 'build_absolute_uri') else "",
        "X-Title": "Canada SaaS Immigration Advisor"
    }
    
    payload_data = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    print("\n" + "-" * 80)
    print("SENDING REQUEST TO OPENROUTER API:")
    print("-" * 80)
    print(f"Model: {payload_data['model']}")
    print(f"Temperature: {payload_data['temperature']}")
    print(f"Max Tokens: {payload_data['max_tokens']}")
    print(f"System Prompt Length: {len(payload_data['messages'][0]['content'])} chars")
    print(f"User Prompt Length: {len(payload_data['messages'][1]['content'])} chars")
    print("-" * 80)
    
    try:
        # Make request to OpenRouter API
        print("\nMaking HTTP request to OpenRouter...")
        response = requests.post(
            settings.OPENROUTER_BASE_URL,
            headers=headers,
            json=payload_data,
            timeout=60  # 60 second timeout
        )
        
        print(f"✓ HTTP Response Status: {response.status_code}")
        
        # Check for HTTP errors
        response.raise_for_status()
        
        # Parse response
        response_data = response.json()
        
        print("\n" + "-" * 80)
        print("OPENROUTER API RESPONSE:")
        print("-" * 80)
        print(f"Response keys: {list(response_data.keys())}")
        
        if "usage" in response_data:
            usage = response_data["usage"]
            print(f"Token Usage:")
            print(f"  - Prompt tokens: {usage.get('prompt_tokens', 'N/A')}")
            print(f"  - Completion tokens: {usage.get('completion_tokens', 'N/A')}")
            print(f"  - Total tokens: {usage.get('total_tokens', 'N/A')}")
        
        if "model" in response_data:
            print(f"Model used: {response_data['model']}")
        
        # Extract the report content
        if "choices" in response_data and len(response_data["choices"]) > 0:
            choice = response_data["choices"][0]
            print(f"DEBUG: Choice keys: {list(choice.keys())}")
            print(f"DEBUG: Choice structure: {choice}")
            
            # Try different possible content locations
            if "message" in choice:
                message = choice["message"]
                print(f"DEBUG: Message keys: {list(message.keys())}")
                print(f"DEBUG: Message structure: {message}")
                
                # Try standard content field
                if "content" in message:
                    report_content = message["content"]
                # Try delta content (for streaming responses)
                elif "delta" in message and "content" in message["delta"]:
                    report_content = message["delta"]["content"]
                else:
                    print(f"ERROR: No content found in message. Message: {message}")
                    raise HttpError(500, "No content found in OpenRouter API response message")
            elif "text" in choice:
                # Some models return text directly
                report_content = choice["text"]
            elif "delta" in choice and "content" in choice["delta"]:
                report_content = choice["delta"]["content"]
            else:
                print(f"ERROR: Unexpected choice structure: {choice}")
                raise HttpError(500, "Unexpected response format from OpenRouter API")
            
            # Validate content
            if not report_content or len(report_content.strip()) == 0:
                print("ERROR: Report content is empty!")
                print(f"DEBUG: Full response_data: {json.dumps(response_data, indent=2)}")
                raise HttpError(500, "OpenRouter API returned empty content. Please try again.")
            
            print(f"✓ Report content received (length: {len(report_content)} characters)")
            print(f"✓ First 200 chars: {report_content[:200]}...")
        else:
            print("ERROR: Invalid response format - no choices found")
            print(f"Response data: {json.dumps(response_data, indent=2)}")
            raise HttpError(500, "Invalid response format from OpenRouter API")
        
        # Generate PDF from Markdown
        print("\n" + "-" * 80)
        print("PDF GENERATION PROCESS:")
        print("-" * 80)
        
        pdf_filename = None
        pdf_path = None
        pdf_url = None
        try:
            print("Step 1: Generating PDF filename...")
            pdf_filename = generate_pdf_filename()
            print(f"✓ PDF filename: {pdf_filename}")
            
            print("Step 2: Getting PDF storage path...")
            pdf_path = get_pdf_storage_path(pdf_filename)
            print(f"✓ PDF storage path: {pdf_path}")
            
            print("Step 3: Converting Markdown to PDF...")
            print(f"  - Markdown length: {len(report_content)} characters")
            print(f"  - Output file: {pdf_path}")
            markdown_to_pdf(report_content, pdf_path)
            
            # Check if file was created
            import os
            if os.path.exists(pdf_path):
                file_size = os.path.getsize(pdf_path)
                print(f"✓ PDF file created successfully!")
                print(f"  - File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
            else:
                print(f"⚠ WARNING: PDF file not found at {pdf_path}")
            
            print("Step 4: Generating PDF URL...")
            pdf_url = get_pdf_url(pdf_filename)
            print(f"✓ PDF URL: {pdf_url}")
            
            # Ensure PDF URL is properly formatted
            if not pdf_url.startswith('http') and not pdf_url.startswith('/'):
                pdf_url = f"/{pdf_url}"
                print(f"✓ PDF URL formatted: {pdf_url}")
            
            print("-" * 80)
            print("✓ PDF generation completed successfully!")
            
        except Exception as e:
            # Log the full error for debugging
            import traceback
            error_details = traceback.format_exc()
            print("\n" + "=" * 80)
            print("PDF GENERATION ERROR:")
            print("=" * 80)
            print(f"Error: {str(e)}")
            print(f"\nFull traceback:\n{error_details}")
            print("=" * 80)
            # Continue without PDF - return report anyway
            print("⚠ WARNING: PDF generation failed, but continuing with markdown report.")
        
        # Save report to database
        print("\n" + "-" * 80)
        print("DATABASE STORAGE:")
        print("-" * 80)
        
        try:
            # Convert profile data to dict for JSON storage
            profile_dict = payload.model_dump()
            print(f"✓ Profile data converted to dict ({len(str(profile_dict))} chars)")
            
            # Get authenticated user if available
            user = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user = request.user
                print(f"✓ Authenticated user: {user.username}")
            else:
                print("✓ Anonymous user")
            
            print("Creating database record...")
            # Create report record (PDF fields can be None if PDF generation failed)
            report = ImmigrationReport.objects.create(
                user_name=payload.user_name,
                user_email=payload.user_email,
                user_phone=payload.user_phone,
                user=user,
                profile_data=profile_dict,
                report_markdown=report_content,
                pdf_filename=pdf_filename or None,
                pdf_path=pdf_path or None,
                pdf_url=pdf_url or None,
                pathway_goal=payload.path,
                ai_model_used=settings.OPENROUTER_MODEL,
            )
            
            print(f"✓ Report saved to database")
            print(f"  - Report ID: {report.id}")
            print(f"  - Created at: {report.created_at}")
            print(f"  - PDF filename: {report.pdf_filename or 'None'}")
            print(f"  - PDF URL: {report.pdf_url or 'None'}")
            print(f"  - PDF path: {report.pdf_path or 'None'}")
            
            # Build response
            response_data = {
                "id": str(report.id),
                "report": report_content,
                "pdf_filename": pdf_filename,
                "pdf_url": pdf_url,
                "pdf_path": pdf_path,
                "created_at": report.created_at.isoformat()
            }
            
            print("\n" + "=" * 80)
            print("FINAL RESPONSE:")
            print("=" * 80)
            print(f"Report ID: {response_data['id']}")
            print(f"Report length: {len(response_data['report'])} characters")
            print(f"PDF filename: {response_data['pdf_filename'] or 'None'}")
            print(f"PDF URL: {response_data['pdf_url'] or 'None'}")
            print(f"PDF path: {response_data['pdf_path'] or 'None'}")
            print(f"Created at: {response_data['created_at']}")
            print("=" * 80)
            
            return ImmigrationReportResponse(**response_data)
        except Exception as e:
            # If database save fails, still return the report but log the error
            raise HttpError(
                500,
                f"Failed to save report to database: {str(e)}"
            )
        
    except requests.exceptions.Timeout:
        raise HttpError(504, "Request to OpenRouter API timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        raise HttpError(
            502,
            f"Error communicating with OpenRouter API: {str(e)}"
        )
    except KeyError as e:
        raise HttpError(
            500,
            f"Unexpected response format from OpenRouter API: {str(e)}"
        )
    except json.JSONDecodeError:
        raise HttpError(500, "Invalid JSON response from OpenRouter API")
    except Exception as e:
        raise HttpError(
            500,
            f"An unexpected error occurred: {str(e)}"
        )


class ImmigrationReportListSchema(BaseModel):
    """Schema for listing immigration reports"""
    id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    pathway_goal: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle UUID and datetime serialization"""
        def serialize_datetime(value):
            if value is None:
                return None
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            return str(value)

        return cls(
            id=str(obj.id),
            user_name=obj.user_name,
            user_email=obj.user_email,
            pathway_goal=obj.pathway_goal,
            pdf_url=obj.pdf_url,
            created_at=serialize_datetime(obj.created_at),
        )

    class Config:
        from_attributes = True


class ImmigrationReportDetailSchema(BaseModel):
    """Schema for detailed immigration report"""
    id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    profile_data: dict
    report_markdown: str
    pdf_filename: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_path: Optional[str] = None
    pathway_goal: Optional[str] = None
    ai_model_used: Optional[str] = None
    created_at: str
    updated_at: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle UUID and datetime serialization"""
        def serialize_datetime(value):
            if value is None:
                return None
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            return str(value)

        return cls(
            id=str(obj.id),
            user_name=obj.user_name,
            user_email=obj.user_email,
            user_phone=obj.user_phone,
            profile_data=obj.profile_data or {},
            report_markdown=obj.report_markdown or '',
            pdf_filename=obj.pdf_filename,
            pdf_url=obj.pdf_url,
            pdf_path=obj.pdf_path,
            pathway_goal=obj.pathway_goal,
            ai_model_used=obj.ai_model_used,
            created_at=serialize_datetime(obj.created_at),
            updated_at=serialize_datetime(obj.updated_at),
        )

    class Config:
        from_attributes = True


@router.get("/reports", response=List[ImmigrationReportListSchema], auth=None)
def list_immigration_reports(request, user_email: Optional[str] = None, limit: int = 50):
    """
    List immigration reports. Can filter by user_email.
    """
    queryset = ImmigrationReport.objects.all()
    
    if user_email:
        queryset = queryset.filter(user_email=user_email)
    
    reports = queryset[:limit]
    return [ImmigrationReportListSchema.from_orm(report) for report in reports]


@router.get("/reports/{report_id}", response=ImmigrationReportDetailSchema, auth=None)
def get_immigration_report(request, report_id: str):
    """
    Get a specific immigration report by ID.
    """
    import uuid
    print(f"\n[GET REPORT] Fetching report with ID: {report_id}")
    
    try:
        # Validate UUID format
        try:
            uuid.UUID(report_id)
        except ValueError:
            print(f"[GET REPORT] ERROR: Invalid UUID format: {report_id}")
            raise HttpError(400, f"Invalid report ID format: {report_id}")
        
        print(f"[GET REPORT] UUID format valid, querying database...")
        report = ImmigrationReport.objects.get(id=report_id)
        print(f"[GET REPORT] Report found: {report.id}, created: {report.created_at}")
        
        # Serialize using from_orm
        serialized = ImmigrationReportDetailSchema.from_orm(report)
        print(f"[GET REPORT] Report serialized successfully")
        return serialized
        
    except ImmigrationReport.DoesNotExist:
        print(f"[GET REPORT] ERROR: Report not found in database")
        raise HttpError(404, f"Report not found with ID: {report_id}")
    except Exception as e:
        print(f"[GET REPORT] ERROR: {str(e)}")
        import traceback
        print(f"[GET REPORT] Traceback: {traceback.format_exc()}")
        raise HttpError(500, f"Error retrieving report: {str(e)}")


@router.get("/reports/user/{user_email}", response=List[ImmigrationReportListSchema], auth=None)
def get_user_reports(request, user_email: str):
    """
    Get all reports for a specific user by email.
    """
    reports = ImmigrationReport.objects.filter(user_email=user_email).order_by('-created_at')
    return [ImmigrationReportListSchema.from_orm(report) for report in reports]

