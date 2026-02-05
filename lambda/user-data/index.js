const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const httpMethod = event.httpMethod;
    const userId = event.requestContext.authorizer.claims.sub; // From Cognito
    const body = event.body ? JSON.parse(event.body) : {};
    const queryParams = event.queryStringParameters || {};

    console.log(`User ${userId} - ${httpMethod} request`);

    switch (httpMethod) {
      case 'GET':
        return await handleGet(userId, queryParams);
      case 'POST':
        return await handlePost(userId, body);
      case 'PUT':
        return await handlePut(userId, body);
      case 'DELETE':
        return await handleDelete(userId, queryParams);
      default:
        return response(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};

async function handleGet(userId, params) {
  const { type } = params;

  switch (type) {
    case 'profile':
      return await getUserProfile(userId);
    case 'templates':
      return await getWorkoutTemplates(userId);
    case 'calendar':
      return await getCalendarWorkouts(userId, params.startDate, params.endDate);
    case 'records':
      return await getPersonalRecords(userId);
    case 'all':
      return await getAllUserData(userId);
    default:
      return response(400, { error: 'Invalid type parameter' });
  }
}

async function handlePost(userId, body) {
  const { type, data } = body;

  switch (type) {
    case 'template':
      return await saveWorkoutTemplate(userId, data);
    case 'calendar':
      return await saveCalendarWorkout(userId, data);
    case 'record':
      return await savePersonalRecord(userId, data);
    default:
      return response(400, { error: 'Invalid type parameter' });
  }
}

async function handlePut(userId, body) {
  const { type, data } = body;

  switch (type) {
    case 'profile':
      return await updateUserProfile(userId, data);
    case 'template':
      return await updateWorkoutTemplate(userId, data);
    case 'calendar':
      return await updateCalendarWorkout(userId, data);
    default:
      return response(400, { error: 'Invalid type parameter' });
  }
}

async function handleDelete(userId, params) {
  const { type, id } = params;

  switch (type) {
    case 'template':
      return await deleteWorkoutTemplate(userId, id);
    case 'calendar':
      return await deleteCalendarWorkout(userId, id);
    default:
      return response(400, { error: 'Invalid type parameter' });
  }
}

// ========================================
// User Profile Operations
// ========================================

async function getUserProfile(userId) {
  const command = new GetCommand({
    TableName: process.env.USER_PROFILES_TABLE,
    Key: { userId }
  });

  const result = await docClient.send(command);
  return response(200, result.Item || { userId, createdAt: new Date().toISOString() });
}

async function updateUserProfile(userId, data) {
  const command = new PutCommand({
    TableName: process.env.USER_PROFILES_TABLE,
    Item: {
      userId,
      ...data,
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Profile updated successfully' });
}

// ========================================
// Workout Templates Operations
// ========================================

async function getWorkoutTemplates(userId) {
  const command = new QueryCommand({
    TableName: process.env.WORKOUT_TEMPLATES_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const result = await docClient.send(command);
  return response(200, result.Items || []);
}

async function saveWorkoutTemplate(userId, data) {
  const templateId = data.id || `template-${Date.now()}`;
  
  const command = new PutCommand({
    TableName: process.env.WORKOUT_TEMPLATES_TABLE,
    Item: {
      userId,
      templateId,
      ...data,
      createdAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Template saved successfully', templateId });
}

async function updateWorkoutTemplate(userId, data) {
  const command = new PutCommand({
    TableName: process.env.WORKOUT_TEMPLATES_TABLE,
    Item: {
      userId,
      templateId: data.templateId,
      ...data,
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Template updated successfully' });
}

async function deleteWorkoutTemplate(userId, templateId) {
  const command = new DeleteCommand({
    TableName: process.env.WORKOUT_TEMPLATES_TABLE,
    Key: { userId, templateId }
  });

  await docClient.send(command);
  return response(200, { message: 'Template deleted successfully' });
}

// ========================================
// Calendar Workouts Operations
// ========================================

async function getCalendarWorkouts(userId, startDate, endDate) {
  const command = new QueryCommand({
    TableName: process.env.CALENDAR_WORKOUTS_TABLE,
    IndexName: 'DateIndex',
    KeyConditionExpression: 'userId = :userId AND workoutDate BETWEEN :startDate AND :endDate',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':startDate': startDate || '2020-01-01',
      ':endDate': endDate || '2099-12-31'
    }
  });

  const result = await docClient.send(command);
  return response(200, result.Items || []);
}

async function saveCalendarWorkout(userId, data) {
  const workoutId = data.id || `workout-${Date.now()}`;
  
  const command = new PutCommand({
    TableName: process.env.CALENDAR_WORKOUTS_TABLE,
    Item: {
      userId,
      workoutId,
      workoutDate: data.savedAt || new Date().toISOString().split('T')[0],
      ...data,
      createdAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Workout saved successfully', workoutId });
}

async function updateCalendarWorkout(userId, data) {
  const command = new PutCommand({
    TableName: process.env.CALENDAR_WORKOUTS_TABLE,
    Item: {
      userId,
      workoutId: data.workoutId,
      workoutDate: data.savedAt || new Date().toISOString().split('T')[0],
      ...data,
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Workout updated successfully' });
}

async function deleteCalendarWorkout(userId, workoutId) {
  const command = new DeleteCommand({
    TableName: process.env.CALENDAR_WORKOUTS_TABLE,
    Key: { userId, workoutId }
  });

  await docClient.send(command);
  return response(200, { message: 'Workout deleted successfully' });
}

// ========================================
// Personal Records Operations
// ========================================

async function getPersonalRecords(userId) {
  const command = new QueryCommand({
    TableName: process.env.PERSONAL_RECORDS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const result = await docClient.send(command);
  return response(200, result.Items || []);
}

async function savePersonalRecord(userId, data) {
  const recordId = `record-${Date.now()}`;
  
  const command = new PutCommand({
    TableName: process.env.PERSONAL_RECORDS_TABLE,
    Item: {
      userId,
      recordId,
      ...data,
      createdAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return response(200, { message: 'Record saved successfully', recordId });
}

// ========================================
// Get All User Data
// ========================================

async function getAllUserData(userId) {
  const [profile, templates, workouts, records] = await Promise.all([
    getUserProfile(userId),
    getWorkoutTemplates(userId),
    getCalendarWorkouts(userId),
    getPersonalRecords(userId)
  ]);

  return response(200, {
    profile: JSON.parse(profile.body),
    templates: JSON.parse(templates.body),
    workouts: JSON.parse(workouts.body),
    records: JSON.parse(records.body)
  });
}

// ========================================
// Helper Functions
// ========================================

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}