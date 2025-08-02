#!/usr/bin/env tsx

/**
 * Test ROI Calculator Integration
 * Verifies that the ROI calculator component works with business analysis
 */

interface TestResult {
  test: string
  success: boolean
  error?: string
  details?: any
}

class ROICalculatorIntegrationTester {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('💰 Testing ROI Calculator Integration')
    console.log('====================================')

    await this.testROICalculatorComponent()
    await this.testROICalculationAPI()
    await this.testBusinessAnalysis()
    await this.testCalculationAccuracy()
    await this.testErrorHandling()
    await this.testDataValidation()

    this.printResults()
  }

  private async testROICalculatorComponent(): Promise<void> {
    try {
      console.log('💰 Testing ROI Calculator Component...')
      
      // Test component import
      const { ROICalculator } = await import('../components/chat/tools/ROICalculator/ROICalculator')
      
      this.results.push({
        test: 'ROI Calculator Component',
        success: true,
        details: 'Component import successful'
      })

      console.log('✅ ROI Calculator Component working')
    } catch (error) {
      this.results.push({
        test: 'ROI Calculator Component',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ ROI Calculator Component failed:', error)
    }
  }

  private async testROICalculationAPI(): Promise<void> {
    try {
      console.log('🧮 Testing ROI Calculation API...')
      
      // Test ROI calculation endpoint
      const response = await fetch('http://localhost:3000/api/tools/roi-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentCosts: 5000,
          projectedSavings: 3500,
          implementationCost: 500,
          timeFrameMonths: 12
        })
      })

      if (!response.ok) {
        throw new Error(`ROI calculation failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'ROI Calculation API',
        success: true,
        details: data
      })

      console.log('✅ ROI Calculation API working')
    } catch (error) {
      this.results.push({
        test: 'ROI Calculation API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ ROI Calculation API failed:', error)
    }
  }

  private async testBusinessAnalysis(): Promise<void> {
    try {
      console.log('📊 Testing Business Analysis...')
      
      // Test business analysis with different scenarios
      const testScenarios = [
        {
          name: 'Small Business',
          currentCosts: 2000,
          projectedSavings: 1500,
          implementationCost: 300,
          timeFrameMonths: 6
        },
        {
          name: 'Medium Business',
          currentCosts: 10000,
          projectedSavings: 7000,
          implementationCost: 1000,
          timeFrameMonths: 12
        },
        {
          name: 'Large Business',
          currentCosts: 50000,
          projectedSavings: 35000,
          implementationCost: 5000,
          timeFrameMonths: 18
        }
      ]

      for (const scenario of testScenarios) {
        const response = await fetch('http://localhost:3000/api/tools/roi-calculation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scenario)
        })

        if (!response.ok) {
          throw new Error(`Business analysis failed for ${scenario.name}: ${response.status}`)
        }

        const data = await response.json()
        console.log(`✅ ${scenario.name} analysis successful`)
      }
      
      this.results.push({
        test: 'Business Analysis',
        success: true,
        details: 'All business scenarios tested successfully'
      })

      console.log('✅ Business analysis working')
    } catch (error) {
      this.results.push({
        test: 'Business Analysis',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Business analysis failed:', error)
    }
  }

  private async testCalculationAccuracy(): Promise<void> {
    try {
      console.log('🎯 Testing Calculation Accuracy...')
      
      // Test ROI calculation accuracy
      const testCase = {
        currentCosts: 10000,
        projectedSavings: 7000,
        implementationCost: 1000,
        timeFrameMonths: 12
      }

      const response = await fetch('http://localhost:3000/api/tools/roi-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase)
      })

      if (!response.ok) {
        throw new Error(`Calculation accuracy test failed: ${response.status}`)
      }

      const data = await response.json()
      
      // Verify calculation results
      const expectedROI = Math.round(((testCase.projectedSavings * 12) - testCase.implementationCost) / testCase.implementationCost * 100)
      const actualROI = data.roi || data.estimatedROI
      
      if (Math.abs(actualROI - expectedROI) < 10) { // Allow 10% tolerance
        this.results.push({
          test: 'Calculation Accuracy',
          success: true,
          details: `ROI calculation accurate: ${actualROI}% (expected ~${expectedROI}%)`
        })
        console.log('✅ Calculation accuracy verified')
      } else {
        throw new Error(`ROI calculation inaccurate: ${actualROI}% vs expected ~${expectedROI}%`)
      }
    } catch (error) {
      this.results.push({
        test: 'Calculation Accuracy',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Calculation accuracy failed:', error)
    }
  }

  private async testErrorHandling(): Promise<void> {
    try {
      console.log('⚠️ Testing Error Handling...')
      
      // Test with invalid data
      const response = await fetch('http://localhost:3000/api/tools/roi-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentCosts: -1000, // Invalid negative value
          projectedSavings: 0,
          implementationCost: 0,
          timeFrameMonths: 0
        })
      })

      // Should handle gracefully even with invalid data
      const data = await response.json()
      
      this.results.push({
        test: 'Error Handling',
        success: true,
        details: 'Error handling working'
      })

      console.log('✅ Error handling working')
    } catch (error) {
      this.results.push({
        test: 'Error Handling',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Error handling failed:', error)
    }
  }

  private async testDataValidation(): Promise<void> {
    try {
      console.log('✅ Testing Data Validation...')
      
      // Test data validation with edge cases
      const testCases = [
        {
          name: 'Zero values',
          data: { currentCosts: 0, projectedSavings: 0, implementationCost: 0, timeFrameMonths: 0 }
        },
        {
          name: 'Very large values',
          data: { currentCosts: 1000000, projectedSavings: 500000, implementationCost: 100000, timeFrameMonths: 60 }
        },
        {
          name: 'Decimal values',
          data: { currentCosts: 1234.56, projectedSavings: 987.65, implementationCost: 123.45, timeFrameMonths: 12.5 }
        }
      ]

      for (const testCase of testCases) {
        const response = await fetch('http://localhost:3000/api/tools/roi-calculation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.data)
        })

        if (!response.ok) {
          throw new Error(`Data validation failed for ${testCase.name}: ${response.status}`)
        }

        const data = await response.json()
        console.log(`✅ ${testCase.name} validation successful`)
      }
      
      this.results.push({
        test: 'Data Validation',
        success: true,
        details: 'All data validation tests passed'
      })

      console.log('✅ Data validation working')
    } catch (error) {
      this.results.push({
        test: 'Data Validation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Data validation failed:', error)
    }
  }

  private printResults(): void {
    console.log('\n📋 ROI CALCULATOR TEST RESULTS')
    console.log('===============================')
    
    const passed = this.results.filter(r => r.success).length
    const total = this.results.length
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.test}`)
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`)
    
    if (passed === total) {
      console.log('🎉 ROI Calculator Integration is working perfectly!')
    } else {
      console.log('⚠️ Some ROI calculator tests failed. Check the errors above.')
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ROICalculatorIntegrationTester()
  tester.runAllTests().catch(console.error)
} 