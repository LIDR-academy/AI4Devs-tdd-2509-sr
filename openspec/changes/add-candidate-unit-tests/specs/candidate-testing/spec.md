# Candidate Testing Specification

## ADDED Requirements

### Requirement: Controller Layer Unit Tests
The system SHALL have unit tests for the candidate controller that verify form data reception and HTTP response handling.

#### Scenario: Successful candidate creation from valid form data
- **WHEN** the controller receives a valid candidate data object in the request body
- **THEN** it calls the candidate service with the correct data
- **AND** returns HTTP status 201 with success message and candidate data

#### Scenario: Error handling for invalid form data
- **WHEN** the controller receives invalid or malformed candidate data
- **THEN** it returns HTTP status 400 with an appropriate error message
- **AND** the error message describes the validation failure

#### Scenario: Database error propagation
- **WHEN** the service layer throws a database error (e.g., duplicate email)
- **THEN** the controller returns HTTP status 400 with the error message from the service

### Requirement: Service Layer Unit Tests
The system SHALL have unit tests for the candidate service that verify database persistence logic and data validation.

#### Scenario: Successful candidate save to database
- **WHEN** valid candidate data is provided to the service
- **THEN** the candidate is saved to the database with correct field mappings
- **AND** the saved candidate is returned with an assigned ID

#### Scenario: Validation error handling
- **WHEN** candidate data fails validation (e.g., invalid email format, missing required fields)
- **THEN** a validation error is thrown before attempting database save
- **AND** the error message describes the validation failure

#### Scenario: Database constraint violation handling
- **WHEN** attempting to save a candidate with a duplicate email address
- **THEN** a Prisma unique constraint error (P2002) is caught
- **AND** a user-friendly error message is thrown indicating the email already exists

#### Scenario: Related entities persistence
- **WHEN** candidate data includes educations, workExperiences, or resume data
- **THEN** each related entity is saved to the database with the correct candidateId foreign key
- **AND** all related entities are successfully persisted

#### Scenario: Database connection error handling
- **WHEN** the database connection fails during candidate save
- **THEN** a PrismaClientInitializationError is caught
- **AND** a user-friendly error message is thrown indicating database connection failure

