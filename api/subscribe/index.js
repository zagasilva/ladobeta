const { TableClient } = require("@azure/data-tables");
const crypto = require("crypto");

/**
 * Azure Function: subscribe
 * Expects POST { email: string }
 * Stores the email in Azure Table Storage in table 'Subscribers'
 * Environment variable required: STORAGE_CONN (Storage account connection string)
 */
module.exports = async function (context, req) {
  context.log('Subscribe function processed a request.');

  try {
    if (req.method !== 'POST') {
      context.res = { status: 405, body: { ok: false, message: 'method not allowed' } };
      return;
    }

    const email = (req.body && req.body.email || '').toString().trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      context.res = { status: 400, body: { ok: false, message: 'invalid email' } };
      return;
    }

    const connectionString = process.env.STORAGE_CONN;
    if (!connectionString) {
      context.log.error('STORAGE_CONN is not configured');
      context.res = { status: 500, body: { ok: false, message: 'storage not configured' } };
      return;
    }

    const tableName = 'Subscribers';
    const client = TableClient.fromConnectionString(connectionString, tableName);

    const partitionKey = 'Subscribers';
    const rowKey = crypto.createHash('sha256').update(email).digest('hex');

    // Check if already exists
    try {
      await client.getEntity(partitionKey, rowKey);
      // already exists
      context.res = { status: 200, body: { ok: true, message: 'already-subscribed' } };
      return;
    } catch (err) {
      // getEntity throws when not found — proceed to create
    }

    const entity = {
      partitionKey,
      rowKey,
      email,
      createdAt: new Date().toISOString()
    };

    await client.createEntity(entity);

    context.res = { status: 200, body: { ok: true, message: 'saved' } };
  } catch (err) {
    context.log.error('Error saving subscriber:', err);
    context.res = { status: 500, body: { ok: false, message: 'server error' } };
  }
};
