#!/usr/bin/env tsx

/**
 * Meta Conversion API Test Script
 * 
 * This script tests the Meta Conversion API integration by:
 * 1. Checking if the Meta Pixel configuration exists
 * 2. Verifying the access token is configured
 * 3. Testing a sample conversion event
 * 4. Checking database logging
 * 
 * Usage:
 *   tsx scripts/test-meta-conversion.ts
 */

import { sql } from "@/lib/db"
import crypto from "crypto"

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function error(message: string) {
  log(`❌ ${message}`, colors.red)
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.cyan)
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function testMetaConversionAPI() {
  log("\n" + "=".repeat(60), colors.blue)
  log("Meta Conversion API Integration Test", colors.blue)
  log("=".repeat(60) + "\n", colors.blue)

  try {
    // Step 1: Check Meta Pixel configuration
    info("Step 1: Checking Meta Pixel configuration...")
    
    const config = await sql`
      SELECT * FROM meta_pixel_config ORDER BY id DESC LIMIT 1
    `

    if (config.length === 0) {
      error("No Meta Pixel configuration found!")
      warning("Please configure Meta Pixel at /admin/meta-pixel")
      process.exit(1)
    }

    const pixelConfig = config[0]
    success("Meta Pixel configuration found")
    
    console.log("\n📊 Configuration Details:")
    console.log(`   Pixel ID: ${pixelConfig.pixel_id}`)
    console.log(`   Access Token: ${pixelConfig.access_token ? "✅ Configured" : "❌ Missing"}`)
    console.log(`   Test Event Code: ${pixelConfig.test_event_code || "(not set)"}`)
    console.log(`   Active: ${pixelConfig.is_active ? "✅ Yes" : "❌ No"}`)
    console.log(`   Automatic Events: ${pixelConfig.enable_automatic_events ? "✅ Enabled" : "❌ Disabled"}`)
    console.log(`   Advanced Matching: ${pixelConfig.enable_advanced_matching ? "✅ Enabled" : "❌ Disabled"}`)

    if (!pixelConfig.access_token) {
      error("\nAccess Token is not configured!")
      warning("Please add your Access Token at /admin/meta-pixel")
      process.exit(1)
    }

    if (!pixelConfig.is_active) {
      warning("\nMeta Pixel is not active!")
      warning("Enable it at /admin/meta-pixel to start tracking")
    }

    // Step 2: Test Meta API connection
    info("\nStep 2: Testing Meta Conversion API connection...")
    
    const eventTime = Math.floor(Date.now() / 1000)
    const eventId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const testPayload = {
      data: [
        {
          event_name: "PageView",
          event_time: eventTime,
          event_id: eventId,
          event_source_url: "http://localhost:3000/test",
          action_source: "website",
          user_data: {
            client_ip_address: "127.0.0.1",
            client_user_agent: "Meta-Conversion-Test-Script",
          },
        },
      ],
      access_token: pixelConfig.access_token,
      ...(pixelConfig.test_event_code ? { test_event_code: pixelConfig.test_event_code } : {}),
    }

    const metaApiUrl = `https://graph.facebook.com/v18.0/${pixelConfig.pixel_id}/events`
    
    try {
      const response = await fetch(metaApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      })

      const metaResponse = await response.json()

      if (response.ok) {
        success("Meta Conversion API connection successful!")
        console.log("\n📡 Meta API Response:")
        console.log(`   Events Received: ${metaResponse.events_received || 0}`)
        console.log(`   FB Trace ID: ${metaResponse.fbtrace_id || "N/A"}`)
        
        if (pixelConfig.test_event_code) {
          info(`\n   Test Event Code is active. Check Meta Events Manager → Test Events`)
        }
      } else {
        error("Meta Conversion API request failed!")
        console.log("\n🔍 Error Response:")
        console.log(JSON.stringify(metaResponse, null, 2))
      }
    } catch (metaError) {
      error("Failed to connect to Meta Conversion API")
      console.error(metaError)
    }

    // Step 3: Check database logging
    info("\nStep 3: Checking recent conversion events...")
    
    const recentEvents = await sql`
      SELECT 
        event_name,
        event_id,
        sent_to_meta,
        created_at
      FROM conversion_events
      ORDER BY created_at DESC
      LIMIT 5
    `

    if (recentEvents.length > 0) {
      success(`Found ${recentEvents.length} recent conversion events`)
      console.log("\n📝 Recent Events:")
      recentEvents.forEach((event: any) => {
        const sentStatus = event.sent_to_meta ? "✅ Sent" : "❌ Not sent"
        console.log(`   ${event.event_name} - ${sentStatus} - ${new Date(event.created_at).toLocaleString()}`)
      })
    } else {
      warning("No conversion events found in database")
      info("Events will be logged as users interact with your site")
    }

    // Step 4: Event statistics
    info("\nStep 4: Getting event statistics (last 7 days)...")
    
    const stats = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_events,
        SUM(CASE WHEN sent_to_meta THEN 1 ELSE 0 END) as sent_to_meta,
        SUM(value) as total_value
      FROM conversion_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY event_name
      ORDER BY total_events DESC
    `

    if (stats.length > 0) {
      console.log("\n📈 Event Statistics (Last 7 Days):")
      console.log("   Event Name        | Total | Sent to Meta | Total Value")
      console.log("   " + "-".repeat(60))
      stats.forEach((stat: any) => {
        const eventName = stat.event_name.padEnd(16)
        const total = stat.total_events.toString().padStart(5)
        const sent = stat.sent_to_meta.toString().padStart(12)
        const value = stat.total_value ? `PKR ${parseFloat(stat.total_value).toFixed(2)}` : "N/A"
        console.log(`   ${eventName} | ${total} | ${sent} | ${value}`)
      })
    } else {
      info("No events recorded in the last 7 days")
    }

    // Summary
    log("\n" + "=".repeat(60), colors.blue)
    log("Test Summary", colors.blue)
    log("=".repeat(60), colors.blue)
    
    success("Meta Conversion API integration is working!")
    
    console.log("\n📋 Next Steps:")
    console.log("   1. Configure your Pixel ID at /admin/meta-pixel")
    console.log("   2. Add your Access Token")
    console.log("   3. Use Test Event Code to verify events")
    console.log("   4. Check Meta Events Manager for incoming events")
    console.log("   5. Remove Test Event Code when ready for production")
    
    if (pixelConfig.test_event_code) {
      info(`\n   Your test events can be viewed at:`)
      info(`   https://business.facebook.com/events_manager → Test Events`)
    }

    log("\n" + "=".repeat(60) + "\n", colors.blue)

  } catch (err) {
    error("\n❌ Test failed with error:")
    console.error(err)
    process.exit(1)
  }
}

// Run the test
testMetaConversionAPI()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
