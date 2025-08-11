import { readFile } from 'fs/promises'
import { join } from 'path'

interface PlagiarismResult {
  similarity: number
  matches: Array<{
    text: string
    startIndex: number
    endIndex: number
    matchedWith: string
  }>
}

class PlagiarismService {
  // Simple text similarity using Jaccard similarity
  private calculateJaccardSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.tokenize(text1))
    const words2 = new Set(this.tokenize(text2))
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)))
    const union = new Set([...Array.from(words1), ...Array.from(words2)])
    
    return intersection.size / union.size
  }

  // Simple tokenization (can be improved with stemming, stop word removal, etc.)
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove very short words
  }

  // Find common phrases between two texts
  private findCommonPhrases(text1: string, text2: string, minLength: number = 5): Array<{
    text: string
    startIndex: number
    endIndex: number
  }> {
    const matches: Array<{
      text: string
      startIndex: number
      endIndex: number
    }> = []

    const words1 = this.tokenize(text1)
    const words2 = this.tokenize(text2)

    for (let i = 0; i < words1.length - minLength + 1; i++) {
      for (let j = 0; j < words2.length - minLength + 1; j++) {
        let matchLength = 0
        
        // Check how many consecutive words match
        while (
          i + matchLength < words1.length &&
          j + matchLength < words2.length &&
          words1[i + matchLength] === words2[j + matchLength]
        ) {
          matchLength++
        }

        if (matchLength >= minLength) {
          const matchedText = words1.slice(i, i + matchLength).join(' ')
          matches.push({
            text: matchedText,
            startIndex: i,
            endIndex: i + matchLength - 1
          })
          
          // Skip ahead to avoid overlapping matches
          i += matchLength - 1
          break
        }
      }
    }

    return matches
  }

  async checkPlagiarism(
    submissionFilePath: string,
    otherSubmissionPaths: string[]
  ): Promise<PlagiarismResult> {
    try {
      const uploadsDir = join(process.cwd(), 'uploads')
      const mainFilePath = join(uploadsDir, submissionFilePath)
      
      // Read the main submission
      const mainContent = await readFile(mainFilePath, 'utf-8')
      
      let maxSimilarity = 0
      const allMatches: Array<{
        text: string
        startIndex: number
        endIndex: number
        matchedWith: string
      }> = []

      // Compare with other submissions
      for (const otherPath of otherSubmissionPaths) {
        try {
          const otherFilePath = join(uploadsDir, otherPath)
          const otherContent = await readFile(otherFilePath, 'utf-8')
          
          // Calculate similarity
          const similarity = this.calculateJaccardSimilarity(mainContent, otherContent)
          maxSimilarity = Math.max(maxSimilarity, similarity)
          
          // Find common phrases if similarity is high enough
          if (similarity > 0.3) {
            const commonPhrases = this.findCommonPhrases(mainContent, otherContent)
            commonPhrases.forEach(phrase => {
              allMatches.push({
                ...phrase,
                matchedWith: otherPath
              })
            })
          }
        } catch (error) {
          console.error(`Error reading file ${otherPath}:`, error)
        }
      }

      return {
        similarity: maxSimilarity,
        matches: allMatches
      }
    } catch (error) {
      console.error('Error in plagiarism check:', error)
      return {
        similarity: 0,
        matches: []
      }
    }
  }

  // Check against online sources (placeholder - would integrate with actual plagiarism APIs)
  async checkOnlinePlagiarism(text: string): Promise<PlagiarismResult> {
    // This is a placeholder implementation
    // In a real application, you would integrate with services like:
    // - Turnitin API
    // - Copyscape API
    // - PlagScan API
    // - Custom web scraping with search engines
    
    return {
      similarity: 0,
      matches: []
    }
  }

  // Generate plagiarism report
  generateReport(result: PlagiarismResult): string {
    const similarityPercentage = (result.similarity * 100).toFixed(1)
    
    let report = `Plagiarism Detection Report\n`
    report += `==========================\n\n`
    report += `Overall Similarity: ${similarityPercentage}%\n\n`
    
    if (result.similarity > 0.7) {
      report += `⚠️  HIGH RISK: This submission shows high similarity to other sources.\n\n`
    } else if (result.similarity > 0.4) {
      report += `⚠️  MEDIUM RISK: This submission shows moderate similarity to other sources.\n\n`
    } else if (result.similarity > 0.2) {
      report += `ℹ️  LOW RISK: This submission shows low similarity to other sources.\n\n`
    } else {
      report += `✅ CLEAR: This submission appears to be original.\n\n`
    }

    if (result.matches.length > 0) {
      report += `Detected Matches:\n`
      report += `-----------------\n`
      
      result.matches.forEach((match, index) => {
        report += `${index + 1}. "${match.text}"\n`
        report += `   Matched with: ${match.matchedWith}\n\n`
      })
    }

    return report
  }
}

export const plagiarismService = new PlagiarismService()