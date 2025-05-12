# Reset R ---------------------------------------------------------------------

rm(list=ls())   # Clear Work Space
graphics.off()  # Clear Plots
cat("\014")     # Clear Terminal

# Libraries -------------------------------------------------------------------

require(tidyverse)
require(rjson)

# Custom Functions ------------------------------------------------------------

load_demographics <- function(userJSON, userID) {
  
  # Initialize empty tibble with results
  answers <- tibble()
  
  # Create (presumably) a hard copy of the file contents
  taskData <- userJSON[[3]] # necessary for some reason. DO NOT DELETE
  
  # Store JSON contents in tibble
  answer <- tibble(
    "userID"      = userID,
    "prolificID"  = taskData$answer$prolificId,
    "gender"      = taskData$answer$gender,
    "ageGroup"    = taskData$answer$ageGroup,
    "education"   = taskData$answer$education,
    "familiarity" = taskData$answer$familiarity,
    "encoding"    = userJSON[[1]]$encoding,
    "dataset"     = userJSON[[1]]$dataset,
    "level"       = userJSON[[1]]$level,
  )
  
  # Return
  return (answer)
  
}

load_quantitative <- function(userJSON, userID) {
  
  # Initialize empty tibble with results
  answers <- tibble()
  
  # Iterate over Quantitative fields and extract as tibble
  for (index in c(6, 8, 10, 12, 14, 16, 18, 20)) {
    
    # Needed to avoid shallow-copy shenanigans
    taskData <- userJSON[[index]]

    # Store JSON contents in tibble
    answer <- tibble(
      "userID"      = userID,
      "encoding"    = taskData$encoding,
      "dataset"     = taskData$dataset,
      "variant"     = taskData$variant,
      "level"       = taskData$level,
      "uncertainty" = taskData$uncertainty,
      "attribute"   = taskData$attribute,
      "task"        = readr::parse_number(taskData$task),
      "answer"      = as.character(unlist(taskData$answer)),
      "time"        = unlist(taskData$time)
    )
    
    # Append tibble to growing tibble
    answers <- bind_rows(answers, answer)
    
  }

  return(answers)
  
}

load_experience <- function(userJSON, userID) {
  
  # Create (presumably) a hard copy of the file contents
  taskData  <- userJSON[[22]] # necessary for some reason. DO NOT DELETE
  
  # Store JSON contents in tibble
  answer <- tibble(
    "userID"    = userID,
    "encoding"  = taskData$encoding,
    "dataset"   = taskData$dataset,
    "level"     = taskData$level,
    "learn"     = taskData$answer$learn,
    "use"       = taskData$answer$use,
    "aesthetic" = taskData$answer$aesth,
    "accuracy"  = taskData$answer$acc,
    "quickly"   = taskData$answer$quick,
    "like"      = taskData$answer$like,
    "dislike"   = taskData$answer$dislike
  )
  
  # Return
  return (answer)
  
}

load_icet <- function(userJSON, userID) {
  
  # Create (presumably) a hard copy of the file contents
  taskData  <- userJSON[[23]] 
  
  # Store JSON contents in tibble
  answer <- tibble(
    "userID"         = userID,
    "encoding"       = userJSON[[1]]$encoding,
    "dataset"        = userJSON[[1]]$dataset,
    "level"          = userJSON[[1]]$level,
    "insight.1.1"    = taskData$answer$`insight-1-1`,
    "insight.1.2"    = taskData$answer$`insight-1-2`,
    "insight.1.3"    = taskData$answer$`insight-1-3`,
    "insight.2.1"    = taskData$answer$`insight-2-1`,
    "insight.2.2"    = taskData$answer$`insight-2-2`,
    "insight.3.1"    = taskData$answer$`insight-3-1`,
    "insight.3.2"    = taskData$answer$`insight-3-2`,
    "insight.3.3"    = taskData$answer$`insight-3-3`,
    "essence.1.1"    = taskData$answer$`essence-1-1`,
    "essence.1.2"    = taskData$answer$`essence-1-2`,
    "essence.2.1"    = taskData$answer$`essence-2-1`,
    "essence.2.2"    = taskData$answer$`essence-2-2`,
    "time.1.1"       = taskData$answer$`time-1-1`,
    "time.1.2"       = taskData$answer$`time-1-2`,
    "time.2.1"       = taskData$answer$`time-2-1`,
    "time.2.2"       = taskData$answer$`time-2-2`,
    "time.2.3"       = taskData$answer$`time-2-3`,
    "confidence.1.1" = taskData$answer$`confidence-1-1`,
    "confidence.1.2" = taskData$answer$`confidence-1-2`,
    "confidence.2.1" = taskData$answer$`confidence-2-1`,
    "confidence.3.1" = taskData$answer$`confidence-3-1`
  )
  
  return (answer)
}

load_qualitative <- function(userJSON, userID) {
  
  # Initialize empty tibble with results
  answers <- tibble()
  
  # Iterate over Quantitative fields and extract as tibble
  for (index in c(7, 9, 11, 13, 15, 17, 19, 21)) {
    
    
    taskData <- userJSON[[index]]
    
    # Store JSON contents in tibble
    answer <- tibble(
      "userID"   = userID,
      "encoding" = taskData$encoding,
      "dataset"  = taskData$dataset,
      "level"    = taskData$level,
      "task"     = readr::parse_number(taskData$task),
      "answer"   = as.character(taskData$answer)
    )
    
    # Append tibble to growing tibble
    answers <- dplyr::bind_rows(answers, answer)
  }
  
  # Add final comment
  answer <- tibble(
    "userID"   = userID,
    "encoding" = userJSON[[1]]$encoding,
    "dataset"  = userJSON[[1]]$dataset,
    "level"    = userJSON[[1]]$level,
    "task"     = 9,
    "answer"   = userJSON[[22]]$answer$comments
  )
  
  answers <- dplyr::bind_rows(answers, answer)
  
}

load_tutorial <- function(userJSON, userID) {
  
  taskData <- userJSON[[4]]
  
  # Add final comment
  tutorial_nl <- tibble(
    "userID"   = userID,
    "encoding" = userJSON[[1]]$encoding,
    "dataset"  = userJSON[[1]]$dataset,
    "level"    = userJSON[[1]]$level,
    "tutorial" = "Node-Link",
    "time"     = taskData$time
  )
  
  taskData <- userJSON[[5]]
  
  # Add final comment
  tutorial_encoding <- tibble(
    "userID"   = userID,
    "encoding" = userJSON[[1]]$encoding,
    "dataset"  = userJSON[[1]]$dataset,
    "level"    = userJSON[[1]]$level,
    "tutorial" = "Encoding",
    "time"     = taskData$time
  )
  
  return(dplyr::bind_rows(tutorial_nl, tutorial_encoding))
  
}

# Specify Run Parameters-------------------------------------------------------

# Specify location and extraction
rootDir <- "./data/users/raw"
outDir  <- "./data/users/parsed"
files   <- list.files(rootDir)
pattern <- "(fuzzy|enclosure|wiggle|saturate)_(ants|raccoons)_(low|high)#(.+).json"

# Parse Data ------------------------------------------------------------------

# Initialize empty tibbles within which to store raw data
quantitatives <- tibble()
experiences   <- tibble()
demographics  <- tibble()
ice_ts        <- tibble()
qualitatives  <- tibble()
tutorials     <- tibble()

# Iterate over all files and extract contents as tibbles
for (file in files) {
  
  # Load JSON File
  userID   <- str_match(string = file, pattern = pattern)[5]
  userJSON <- rjson::fromJSON(file = file.path(rootDir, file), simplify = F)
  
  # If participant navigated back and forth, skip data entry
  if (length(userJSON) != 23) {
    print(paste("SKIPPED FILE", file, sep = " "))
    next
  }
  
  # Load Demographics
  demographic  <- load_demographics(userJSON, userID)
  demographics <- dplyr::bind_rows(demographics, demographic)
  
  # Load Quantitative
  quantitative  <- load_quantitative(userJSON, userID)
  quantitatives <- dplyr::bind_rows(quantitatives, quantitative)

  # user experience
  experience  <- load_experience(userJSON, userID)
  experiences <- dplyr::bind_rows(experience, experiences)

  # ICET
  ice_t  <- load_icet(userJSON, userID)
  ice_ts <- dplyr::bind_rows(ice_t, ice_ts)

  # Qualitative
  qualitative  <- load_qualitative(userJSON, userID)
  qualitatives <- dplyr::bind_rows(qualitatives, qualitative)

  # Load TUtorial times
  tutorial  <- load_tutorial(userJSON, userID)
  tutorials <- dplyr::bind_rows(tutorials, tutorial)

}


# Save Data -------------------------------------------------------------------

if(!dir.exists(outDir)){dir.create(outDir)}

# Save Demographics to CSV
write.table(x          = demographics,
            file      = "./data/users/parsed/demographics.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)

# Save quantitative to CSV
write.table(x          = quantitatives,
            file      = "./data/users/parsed/quantitative.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)

# Save experience to CSV
write.table(x          = experiences,
            file      = "./data/users/parsed/experiences.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)


# Save Qualitative to CSV
write.table(x          = qualitatives,
            file      = "./data/users/parsed/qualitative.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)

# Save ICE-T to CSV
write.table(x          = ice_ts,
            file      = "./data/users/parsed/ice_t.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)

# Save tutorial to CSV
write.table(x          = tutorials,
            file      = "./data/users/parsed/tutorials.csv",
            append    = FALSE,
            quote     = TRUE,
            sep       = ",",
            row.names = FALSE,
            col.names = TRUE)