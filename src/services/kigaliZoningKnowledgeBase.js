// =============================================================================
// KIGALI MASTER PLAN ZONING REGULATIONS - AUTHORITATIVE KNOWLEDGE BASE
// Source: Kigali City Zoning Regulations (Effective August 28, 2020)
// Document: 2019 Kigali Master Plan Review - Zoning Regulations FINAL
// =============================================================================

const ZONING_KNOWLEDGE_BASE = {
    metadata: {
        documentTitle: "Kigali City Zoning Regulations",
        effectiveDate: "August 28, 2020",
        authority: "City of Kigali City Council",
        legalBasis: "Rwanda Urban Planning Code",
        source: "Consultancy Services for 2013 Kigali Master Plan Update (Project Ref: C-RW-000011)"
    },

    // =============================================================================
    // RESIDENTIAL ZONES
    // =============================================================================
    
    "R1": {
        fullName: "Low Density Residential Zone",
        code: "R1",
        article: "Article 6.1",
        table: "Table 6.1",
        description: "Intended for villa and bungalow typology and complementary public facilities. R1 Zones are limited in the City of Kigali to existing consolidated areas with the objective of limiting low-density urban development and encouraging compact development.",
        
        uses: {
            permitted: [
                "Single family houses",
                "Home Occupation"
            ],
            conditional: [
                "Uses as per R1A regulations",
                "Apartments exceeding G+2",
                "Semi-Detached",
                "Multifamily Houses",
                "Restaurants, Guest houses, B&B, Hotels (including ancillary commercial uses)",
                "Public facilities when suggested by Public Facilities Overlay (Section 7.1)",
                "Commercial Retail Facilities when allowed by O-C2 Overlay (Section 6.2.2)",
                "Accessory Residential Units"
            ],
            prohibited: [
                "Industrial uses",
                "Major infrastructure"
            ],
            ancillary: [
                "Car parking garage",
                "Store and Service rooms",
                "Guard House"
            ]
        },

        development: {
            lotSize: {
                max: "500 m²",
                note: "As per Urban Planning Code (UPC). Plots less than 300 m² shall follow R1A regulations. Existing developments on plots larger than 500 m² can retain their use."
            },
            coverage: {
                maxBuilding: "40%",
                minLandscaping: "20%"
            },
            far: {
                max: 0.5
            },
            density: {
                singleUse: "10-15 Du/Ha",
                mixedUse: "7-10 Du/Ha (when building is partially occupied by other uses as per O-C2 overlay)"
            }
        },

        building: {
            maxFloors: "G+1+P (Penthouse)",
            ancillaryMaxFloors: "G",
            roof: {
                maxPitch: "30%",
                restrictions: "No reflective metal roofing allowed. Roof colours should blend with surrounding landscape."
            },
            form: ["Detached", "Semi Detached"]
        },

        developmentStrategy: [
            "Individual plot development",
            "Land subdivision",
            "Estate (No gated estates allowed on developments of more than 1 ha)"
        ],

        signage: {
            permitted: "One sign located on the fencing wall along the front setback",
            maxSize: "35cm height x 35cm width",
            restrictions: "Protrusion of signage must be contained within plot boundary"
        }
    },

    "R1A": {
        fullName: "Low Density Residential Densification Zone",
        code: "R1A",
        article: "Article 6.1",
        table: "Table 6.2",
        description: "A residential zone for semidetached houses, single family townhouses, multifamily houses, and low-rise developments. Intended to offer low and medium-rise housing and complementary commercial and public facilities. Lot sizes are smaller than R1 to promote more efficient use of lands in prime areas.",

        uses: {
            permitted: [
                "Single family houses (all types)",
                "Semi-detached houses",
                "Multifamily Houses",
                "Townhouses",
                "Row houses",
                "Home Occupation",
                "Accessory Residential Units"
            ],
            conditional: [
                "Restaurants, Hotels, Guest houses, B&B",
                "Public facilities as per Public Facilities overlay (Section 7.1)",
                "Commercial retail, office facilities when allowed by O-C2 Overlay (Section 6.2.2)"
            ],
            prohibited: [
                "Residential exceeding G+2",
                "Industrial uses",
                "Major infrastructure"
            ],
            ancillary: [
                "Car parking garage",
                "Store and Service rooms",
                "Guard House"
            ]
        },

        development: {
            lotSize: {
                max: "300 m²"
            },
            coverage: {
                maxBuilding: "50%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.0
            },
            density: {
                singleUse: "20-30 Du/Ha",
                mixedUse: "15-20 Du/Ha"
            }
        },

        building: {
            maxFloors: "G+2",
            ancillaryMaxFloors: "G",
            roof: {
                maxPitch: "30%",
                restrictions: "No reflective metal roofing allowed. Roof colours should blend with surrounding landscape."
            },
            form: ["Detached", "Semi Detached", "Attached"]
        },

        developmentStrategy: [
            "Individual plot development",
            "Land Pooling (see Land Assembly Overlay Plan Section 7.3)",
            "Land Subdivision",
            "Estate Development (No gated estates allowed on developments of more than 1 ha)"
        ]
    },

    "R1B": {
        fullName: "Rural Residential Zone",
        code: "R1B",
        article: "Article 6.1",
        table: "Table 6.3",
        description: "A residential zone offering compact developments in rural areas. Intended to offer low-rise, medium-density housing as part of the farming community. Purpose is to create sustainable and compact residential settlement in rural areas, limiting encroachment towards fertile agricultural land.",

        uses: {
            permitted: [
                "Single family Houses",
                "Row housing",
                "Multifamily residential (4 in 1, 8 in 1, etc as per IDP model Villages)",
                "Low-rise apartments",
                "Home Occupation",
                "Accessory Residential Units"
            ],
            conditional: [
                "Restaurants",
                "Hotels/Guest houses",
                "Public facilities when allowed by Public Facilities Overlay",
                "Commercial retail when allowed by O-C2 Overlay",
                "Micro Enterprise"
            ],
            prohibited: [
                "Industrial uses",
                "Major infrastructure"
            ]
        },

        development: {
            lotSize: {
                max: "150 m² (for single family)",
                note: "N/A for Multifamily houses or Apartment development including additional rooms for rental, provided it meets minimum density requirement"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.0
            },
            density: {
                singleUse: "40-60 Du/Ha",
                mixedUse: "30-50 Du/Ha"
            }
        },

        building: {
            maxFloors: "G+2 (One extra floor may be allowed due to topographic conditions)",
            ancillaryMaxFloors: "G",
            form: ["Attached for rowhouses", "Attached/semi-detached/detached Apartments and Multifamily houses"]
        }
    },

    "R2": {
        fullName: "Medium Density Residential - Improvement Zone",
        code: "R2",
        article: "Article 6.1",
        table: "Table 6.4",
        description: "Established for urban improvement zones (existing informal settlements). Offers opportunities for multi-family rental development or mixed-use options without extensive relocation. Regularization of tenure is expected and prioritized.",

        uses: {
            permitted: [
                "Single family Residential",
                "Rowhouses",
                "Low-rise apartments",
                "Multifamily Houses",
                "Home Occupation",
                "Accessory Residential Units"
            ],
            conditional: [
                "Restaurants",
                "Hotels/Guest houses (including ancillary uses)",
                "Public facilities when allowed by Public Facilities Overlay (Section 7.1)",
                "Commercial retail, office when allowed by O-C2 Overlay (Section 6.2.2)",
                "Micro Enterprise"
            ],
            prohibited: [
                "Industrial uses",
                "Major infrastructure"
            ]
        },

        development: {
            lotSize: {
                max: "100 m² for incremental Single-Family Housing in new Subdivision Plans",
                rowhousing: "150 m² for Row housing",
                multifamily: "N/A (provided minimum density is met)"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.2
            },
            density: {
                singleUse: "50-90 Du/Ha",
                mixedUse: "40-70 Du/Ha"
            }
        },

        building: {
            maxFloors: "G+2 (One extra floor may be allowed due to topographic conditions, to achieve required density or technical/economic feasibility)",
            ancillaryMaxFloors: "G",
            roof: {
                maxPitch: "30%",
                restrictions: "No reflective metal roofing allowed"
            },
            form: ["Attached for rowhouses", "Attached/semi-detached/detached Apartments and Multifamily houses"]
        }
    },

    "R3": {
        fullName: "Medium Density Residential - Expansion Zone",
        code: "R3",
        article: "Article 6.1",
        table: "Table 6.5",
        description: "Established to allow intensification and redevelopment of peri-urban and greenfield areas. Expected to stimulate development of low-cost incremental housing. Purpose is to facilitate housing for low-income segment by providing low-rise, higher-intensity developments in greenfield sites.",

        uses: {
            permitted: [
                "Single family Residential",
                "Rowhouses",
                "Low-rise apartments",
                "Multifamily Houses",
                "Accessory Residential units",
                "Home Occupation"
            ],
            conditional: [
                "Restaurants",
                "Hotels/Guest houses (including ancillary uses)",
                "Public facilities when allowed by Public Facilities Overlay (Section 7.1)",
                "Commercial retail, office when allowed by O-C2 Overlay (Section 6.2.2)",
                "Micro Enterprise"
            ],
            prohibited: [
                "Industrial uses",
                "Major infrastructure",
                "Any development that does not meet affordability criteria suggested in these regulations"
            ]
        },

        development: {
            lotSize: {
                singleFamily: "Max 100 m² for incremental Single-Family Housing in new Subdivision Plans",
                rowhousing: "Max 150 m² for Row housing",
                multifamily: "N/A (provided minimum density is met)"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.2
            },
            density: {
                singleUse: "50-90 Du/Ha",
                mixedUse: "40-70 Du/Ha"
            }
        },

        building: {
            maxFloors: "G+2 (One extra floor may be allowed due to topographic conditions, to achieve required density or technical/economic feasibility)",
            ancillaryMaxFloors: "G",
            form: ["Attached for rowhouses", "Attached/semi-detached/detached Apartments and Multifamily houses"]
        },

        developmentStrategy: [
            "Individual private development",
            "Land Pooling (see Land Assembly Overlay Plan Section 7.3)",
            "Sites and Services",
            "Larger plots owned by individuals shall be developed following minimum required densities in an optic of incremental development"
        ]
    },

    "R4": {
        fullName: "High Density Residential Zone",
        code: "R4",
        article: "Article 6.1",
        table: "Table 6.6",
        description: "Established to create well planned medium-rise housing and apartment complexes with integrated commercial and public facilities, open spaces. Minimum lot sizes are higher than R3 to facilitate creation of a well-planned high-density residential mixed-use neighbourhood with green character.",

        uses: {
            permitted: [
                "High density residential",
                "Home Occupation",
                "R2 typologies (in case plot size is less than 750 m²)"
            ],
            conditional: [
                "Restaurants",
                "Hotels (including ancillary uses), Guest house, B&B",
                "Public facilities when allowed by Public Facilities Overlay (Section 7.1)",
                "Commercial retail, office, Micro-Enterprise when allowed by O-C2 Overlay (Section 6.2.2)",
                "Micro Enterprise"
            ],
            prohibited: [
                "Industrial uses",
                "Major infrastructure"
            ],
            ancillary: [
                "Car parking garage",
                "Guard house",
                "Store and services rooms"
            ]
        },

        development: {
            lotSize: {
                min: "750 m²",
                note: "Plots smaller than 750 m² can be developed following R2 regulations. Plots larger than 750 m² can be developed following R2 regulations if plot subdivision allows."
            },
            coverage: {
                maxBuilding: "50%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.8
            },
            density: {
                singleUse: "80-120 Du/Ha",
                mixedUse: "60-80 Du/Ha"
            }
        },

        building: {
            maxFloors: "G+4 (apartments) maximum. One extra floor may be allowed due to topographic conditions, to achieve required density or technical/economic feasibility.",
            ancillaryMaxFloors: "G",
            floorToFloorHeight: "4m maximum",
            form: ["Attached Buildings", "Detached Buildings", "R2 typologies for plots less than 750 m²"]
        },

        developmentStrategy: [
            "Individual development (provided all parcels in the block have proper minimum accessibility)",
            "Land Pooling (see Land Assembly Overlay Plan Section 7.3)",
            "Plots smaller than 750 m² can be developed following R2 or R3 regulations",
            "Plots larger than 750 m² shall not be subdivided if result produces plots smaller than 750 m²"
        ]
    },

    // =============================================================================
    // COMMERCIAL & MIXED-USE ZONES
    // =============================================================================

    "C1": {
        fullName: "Mixed Use Zone",
        code: "C1",
        article: "Article 6.2",
        table: "Table 6.7",
        description: "Established to create high flexibility in the mix of uses and ensure continuity in ground level commercial activities as well as provide employment opportunities in other floors such as offices or accommodation. Offers spaces for goods and services as well as living quarters and rental units to create a vibrant mixed-use commercial zone.",

        uses: {
            permitted: [
                "Commercial / Retail",
                "Restaurants and Recreational activities",
                "Office use above the 1st floor",
                "Co-working spaces",
                "Residential",
                "Home Occupation"
            ],
            conditional: [
                "Public Facilities (see Public Facilities overlay)",
                "Transportation Terminals",
                "Hotels",
                "Petrol stations",
                "Garages and Car Repair - Grade E as per RBS and CoK requirements",
                "Car Wash Services"
            ],
            prohibited: [
                "Large scale commercial complex",
                "Industrial Uses",
                "Major Infrastructure Installations"
            ],
            ancillary: [
                "Electrical substation (ESS)",
                "Refuse area"
            ]
        },

        development: {
            lotSize: {
                min: "500 m²",
                exception: "Plots with size below 500 m² in existing consolidated commercial nodes can implement construction, renewal and refurbishment works provided size is not less than 200 m², following OSC approval"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "10%"
            },
            far: {
                max: 1.6
            }
        },

        building: {
            maxFloors: "G+4 maximum. Additional floors may be authorised by OSC along BRT, Wetland Front, and Green Connectors as per UD Plan.",
            ancillaryMaxFloors: "G",
            form: ["Attached Buildings", "Detached Buildings"]
        },

        circulation: {
            pedestrian: "All buildings facing main commercial road/BRT/wetland front/green corridors shall provide a continuous well designed and universally accessible arcade of no less than 3m. No parking allowed in front setback.",
            publicTransit: "Public Transport Network shall have bus stops spacing at a range of 300-500m"
        },

        signage: {
            buildingIdentification: "One sign permitted on the tower",
            commercial: {
                wall: "15% of Building Face up to 9 m²",
                window: "Transparent, 15% of Building Face up to 2.5 m²",
                awning: "Min 2.5m clearance from ground, 25% of building face up to 2.5 m²"
            },
            prohibited: ["Roof mounted signs", "String lights, flashing, excessively bright lights", "Offsite signage"]
        }
    },

    "C3": {
        fullName: "City Commercial Zone",
        code: "C3",
        article: "Article 6.2",
        table: "Table 6.9",
        description: "Established for high intensity commercial areas with offices, retail, and potentially mixed residential uses. Targets prime commercial locations in the city center and along major corridors.",

        uses: {
            permitted: [
                "Commercial / Retail",
                "Office",
                "Hotels",
                "Restaurants and Recreational activities",
                "Co-working spaces"
            ],
            conditional: [
                "Residential (above 2nd floor)",
                "Public Facilities",
                "Transportation Terminals",
                "Petrol stations",
                "Garages and Car Repair"
            ],
            prohibited: [
                "Industrial Uses",
                "Major Infrastructure Installations"
            ]
        },

        development: {
            lotSize: {
                min: "1000 m²"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "10%"
            },
            far: {
                max: 2.5
            }
        },

        building: {
            maxFloors: "G+8 maximum. Additional floors may be authorised along BRT corridors.",
            form: ["Attached Buildings", "Detached Buildings", "Semi-Detached Buildings"]
        }
    },

    // =============================================================================
    // INDUSTRIAL ZONES
    // =============================================================================

    "I1": {
        fullName: "Light Industrial Zone",
        code: "I1",
        article: "Article 6.5",
        table: "Table 6.16",
        description: "For light manufacturing, assembly, warehousing and distribution activities that have minimal environmental impacts.",

        uses: {
            permitted: [
                "Light manufacturing",
                "Assembly operations",
                "Warehousing",
                "Distribution centers",
                "Research and development facilities"
            ],
            conditional: [
                "Office use (accessory)",
                "Retail showrooms (accessory)",
                "Commercial services"
            ],
            prohibited: [
                "Residential uses",
                "Heavy industrial uses",
                "Polluting industries"
            ]
        },

        development: {
            lotSize: {
                min: "1000 m²"
            },
            coverage: {
                maxBuilding: "60%",
                minLandscaping: "15%"
            },
            far: {
                max: 1.2
            }
        },

        building: {
            maxFloors: "G+2",
            form: ["Detached Buildings", "Attached Buildings"]
        }
    },

    "I2": {
        fullName: "General Industrial Zone",
        code: "I2",
        article: "Article 6.5",
        table: "Table 6.17",
        description: "For general manufacturing and industrial activities that may have moderate environmental impacts requiring buffering from residential areas.",

        uses: {
            permitted: [
                "General manufacturing",
                "Processing industries",
                "Heavy warehousing",
                "Industrial services"
            ],
            conditional: [
                "Hazardous materials storage (with proper permits)",
                "Waste processing"
            ],
            prohibited: [
                "Residential uses",
                "Hotels",
                "Schools and hospitals"
            ]
        },

        development: {
            lotSize: {
                min: "2000 m²"
            },
            coverage: {
                maxBuilding: "50%",
                minLandscaping: "20%"
            },
            far: {
                max: 1.0
            }
        },

        building: {
            maxFloors: "G+2"
        }
    },

    "I3": {
        fullName: "Mining and Quarrying Industrial Zone",
        code: "I3",
        article: "Article 6.5",
        table: "Table 6.18",
        description: "For mining, extraction and quarrying activities with strict environmental controls.",

        uses: {
            permitted: [
                "Mining operations",
                "Quarrying",
                "Extraction activities",
                "Related processing"
            ],
            prohibited: [
                "Residential uses",
                "Commercial retail",
                "Public facilities"
            ]
        }
    },

    // =============================================================================
    // NATURE & OPEN SPACE ZONES
    // =============================================================================

    "P1": {
        fullName: "Parks and Open Spaces Zone",
        code: "P1",
        article: "Article 6.6",
        table: "Table 6.19",
        description: "For parks, recreation areas and public open spaces to serve the community's recreational needs.",

        uses: {
            permitted: [
                "Public parks",
                "Playgrounds",
                "Gardens",
                "Walking/cycling trails",
                "Outdoor recreation"
            ],
            conditional: [
                "Small kiosks/refreshment stands",
                "Sports facilities",
                "Community centers"
            ],
            prohibited: [
                "Residential uses",
                "Commercial development",
                "Industrial uses"
            ]
        },

        development: {
            coverage: {
                maxBuilding: "5%",
                minGreenSpace: "80%"
            }
        }
    },

    "P2": {
        fullName: "Sports and Eco-Tourism Zone",
        code: "P2",
        article: "Article 6.6",
        table: "Table 6.20",
        description: "For sports facilities, eco-tourism activities and related recreational uses."
    },

    "P3B": {
        fullName: "Forest Zone",
        code: "P3-B",
        article: "Article 6.6",
        table: "Table 6.22",
        description: "Protected forest areas with strict development controls for conservation purposes.",

        uses: {
            permitted: [
                "Forest conservation",
                "Nature trails",
                "Environmental education"
            ],
            prohibited: [
                "Building construction",
                "Residential development",
                "Commercial activities"
            ]
        }
    },

    "P3C": {
        fullName: "Steep Slopes Zone (>30%)",
        code: "P3-C",
        article: "Article 6.6",
        table: "Table 6.23",
        description: "Areas with slopes exceeding 30% where development is restricted for safety and environmental reasons.",

        uses: {
            permitted: [
                "Reforestation",
                "Slope stabilization",
                "Nature conservation"
            ],
            prohibited: [
                "Building construction",
                "Any development that may destabilize slopes"
            ]
        },

        restrictions: "No construction allowed on slopes exceeding 30% due to geological and erosion risks."
    },

    // =============================================================================
    // AGRICULTURE ZONE
    // =============================================================================

    "A1": {
        fullName: "Agriculture Zone",
        code: "A",
        article: "Article 6.6",
        table: "Table 6.25",
        description: "For agricultural production, farming activities and rural land uses to preserve productive agricultural land.",

        uses: {
            permitted: [
                "Crop farming",
                "Livestock raising",
                "Agricultural processing (small scale)",
                "Farm buildings and storage",
                "Rural housing for farm operators"
            ],
            conditional: [
                "Agro-tourism",
                "Farm stays",
                "Agricultural research facilities"
            ],
            prohibited: [
                "Urban residential subdivisions",
                "Commercial development",
                "Industrial uses"
            ]
        },

        development: {
            lotSize: {
                min: "1 hectare for agricultural use"
            }
        }
    },

    // =============================================================================
    // PUBLIC FACILITIES ZONES
    // =============================================================================

    "PA": {
        fullName: "Public Administrative Zone",
        code: "PA",
        article: "Article 6.3",
        table: "Table 6.10",
        description: "For government administrative buildings, civic facilities and public services."
    },

    "PF1": {
        fullName: "Education and Research Facilities Zone",
        code: "PF1",
        article: "Article 6.4",
        table: "Table 6.11",
        description: "For schools, universities, research centers and educational facilities."
    },

    "PF2": {
        fullName: "Health Facilities Zone",
        code: "PF2",
        article: "Article 6.4",
        table: "Table 6.12",
        description: "For hospitals, clinics, health centers and medical facilities."
    },

    "PF3": {
        fullName: "Religious Facilities Zone",
        code: "PF3",
        article: "Article 6.4",
        table: "Table 6.13",
        description: "For churches, mosques, temples and other religious facilities."
    },

    "PF4": {
        fullName: "Cultural/Memorial Sites Zone",
        code: "PF4",
        article: "Article 6.4",
        table: "Table 6.14",
        description: "For museums, memorial sites, cultural centers and heritage sites."
    },

    "PF5": {
        fullName: "Cemetery/Crematoria Zone",
        code: "PF5",
        article: "Article 6.4",
        table: "Table 6.15",
        description: "For cemeteries, burial grounds and crematoria."
    },

    // =============================================================================
    // UTILITY & TRANSPORT ZONES
    // =============================================================================

    "T": {
        fullName: "Transportation Zone",
        code: "T",
        article: "Article 6.6",
        table: "Table 6.29",
        description: "For roads, bus stations, terminals and transportation infrastructure."
    },

    "U": {
        fullName: "Utility Zone",
        code: "U",
        article: "Article 6.6",
        table: "Table 6.30",
        description: "For utility installations including water treatment, power substations and telecommunications."
    },

    // =============================================================================
    // WETLAND & WATER ZONES
    // =============================================================================

    "W2": {
        fullName: "Wetland Rehabilitation Zone",
        code: "W2",
        article: "Article 6.6",
        table: "Table 6.26",
        description: "Wetland areas requiring rehabilitation and restoration."
    },

    "W3": {
        fullName: "Wetland Sustainable Exploitation Zone",
        code: "W3",
        article: "Article 6.6",
        table: "Table 6.26",
        description: "Wetland areas where controlled, sustainable use is permitted."
    },

    "W4": {
        fullName: "Wetland Conservation Zone",
        code: "W4",
        article: "Article 6.6",
        table: "Table 6.26",
        description: "Protected wetland areas with strict conservation requirements."
    },

    "W5": {
        fullName: "Wetland Recreational Zone",
        code: "W5",
        article: "Article 6.6",
        table: "Table 6.26",
        description: "Wetland areas designated for recreational activities compatible with wetland conservation."
    },

    "WR": {
        fullName: "Waterbody Zone",
        code: "WB",
        article: "Article 6.6",
        table: "Table 6.28",
        description: "Lakes, rivers and water bodies with buffer requirements."
    },

    // =============================================================================
    // GENERAL PROVISIONS (Article 4)
    // =============================================================================

    generalProvisions: {
        incrementalDevelopment: {
            article: "Article 4.6, Table 4.4",
            description: "Incremental development is allowed and encouraged to shape urban areas as per priorities and reduce urban sprawl in favour of densification.",
            requirements: [
                "Submit conceptual final design of building with expected GFA",
                "Show fulfilment of parking requirements and minimum density prescriptions",
                "Provide tentative Phasing Plan showing planned stages of construction and timeframe",
                "Intermediate building shall not appear incomplete or under construction"
            ]
        },

        homeOccupation: {
            article: "Article 4.10, Table 4.6",
            description: "All Residential Zones allow residents to engage in uses other than residences so long as principal use remains as dwelling.",
            requirements: [
                "No exterior physical changes for business purposes",
                "Maximum 25% of total floor area for business use",
                "Maximum one non-resident worker allowed",
                "Additional off-street parking for every 100 m² of floor area used"
            ],
            permittedActivities: [
                "General Medicine, Dentistry (if allowed by Ministry of Health)",
                "Offices for architecture, engineering, law",
                "Music studios (with sound proofing)",
                "IT consultancy, web design, data entry",
                "Accountancy services",
                "Teaching (not extending to classes or school-like establishments)"
            ],
            prohibited: [
                "Contractors Business",
                "Car-Trading Business",
                "Commercial schools",
                "Employment Agency",
                "Businesses involving large gatherings",
                "Courier Businesses",
                "Funeral chapels or homes"
            ]
        },

        microEnterprise: {
            article: "Article 4.9, Table 4.5",
            description: "Selected Residential zones allow residents to engage in business with no more than five (5) non-resident employees.",
            requirements: [
                "No exterior physical changes not residential in character",
                "Maximum 30% of total floor area for business use",
                "Ground floor only",
                "Additional off-street parking for every 200 m² used"
            ],
            permittedActivities: [
                "Processing/preserving of fruit and vegetables",
                "Manufacture of bakery products",
                "Weaving/finishing of textiles",
                "Manufacture of wearing apparel",
                "Manufacture of footwear",
                "Printing services",
                "Manufacture of jewellery",
                "Manufacture of games and toys",
                "Creative, arts and entertainment activities"
            ]
        },

        gatedCommunities: {
            article: "Article 4.5, Table 4.3",
            description: "CoK shall not allow gated communities in any new development larger than 1 ha to ensure clear linkages and social mix.",
            requirements: [
                "Opaque walls shall not exceed 1.5m height",
                "Only transparent fencing allowed beyond wall height",
                "Existing gated developments larger than 1 ha shall remove barriers within 1 year"
            ]
        },

        accessoryResidentialUnits: {
            article: "Article 4.11",
            description: "Allowed in R1, R1A, R2 and R3 zones to further affordable housing goals.",
            requirements: [
                "Maximum three (3) accessory units per permitted dwelling",
                "Minimum 9 m² for single occupancy, 15 m² for double occupancy",
                "Maximum 50% of gross liveable floor area",
                "Separate external door access required",
                "Separate kitchen, full bath and electric panel required"
            ]
        },

        carWashAutoRepair: {
            article: "Article 4.12",
            description: "Conditionally allowed in all Commercial and Mixed-Use Zones.",
            requirements: [
                "Comply with RS 402 Garages Construction and RS 368 Waste Management guidelines",
                "Noise and air pollution must be limited/mitigated",
                "Hazardous waste must be safely contained in hermetic containers",
                "No activities on public road or sidewalks"
            ]
        }
    },

    // =============================================================================
    // PARKING REQUIREMENTS (Article 6.7)
    // =============================================================================

    parkingRequirements: {
        article: "Article 6.7, Tables 6.31-6.34",
        residential: {
            "Single family": "1 space per unit",
            "Apartment (< 100 m²)": "1 space per unit",
            "Apartment (> 100 m²)": "1.5 spaces per unit",
            "Visitor": "0.25 spaces per unit"
        },
        nonResidential: {
            "Office": "1 space per 50 m² GFA",
            "Retail": "1 space per 30 m² GFA",
            "Restaurant": "1 space per 15 m² dining area",
            "Hotel": "1 space per 2 rooms",
            "Hospital": "1 space per 4 beds",
            "School": "1 space per classroom"
        },
        permeablePaving: "Required for parking lots to manage stormwater",
        derogations: "May be granted in congested areas with shared parking facilities"
    },

    // =============================================================================
    // SETBACK REGULATIONS (Article 6.8)
    // =============================================================================

    setbackRegulations: {
        article: "Article 6.8",
        principles: [
            "Setbacks ensure privacy, light, air and fire safety",
            "Front setback measured from plot boundary fronting road",
            "Rear setback directly opposite to front plot line",
            "Side setback measured horizontally from plot boundary"
        ],
        skyExposurePlane: "Required to ensure adequate light and air to adjacent properties"
    },

    // =============================================================================
    // CONTACT INFORMATION
    // =============================================================================

    contacts: {
        primary: {
            name: "City of Kigali One Stop Centre (OSC)",
            role: "Construction permits, zoning inquiries, variance requests",
            phone: "+250 788 000 000",
            website: "kigalicity.gov.rw"
        },
        permits: {
            name: "Irembo Platform",
            role: "Online permit applications",
            website: "irembo.gov.rw"
        },
        districts: {
            Gasabo: "Gasabo District OSC",
            Nyarugenge: "Nyarugenge District OSC",
            Kicukiro: "Kicukiro District OSC"
        }
    }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get comprehensive zone information by zone code
 */
function getZoneInfo(zoneCode) {
    // Normalize zone name to code
    const normalized = normalizeZoneName(zoneCode);
    return ZONING_KNOWLEDGE_BASE[normalized] || null;
}

/**
 * Normalize various zone name formats to standard code
 */
function normalizeZoneName(zoneName) {
    if (!zoneName) return null;
    
    const normalizations = {
        // Residential
        'R1-Low density residential zone': 'R1',
        'Low Density Residential Zone': 'R1',
        'R1A-Low density residential densification zone': 'R1A',
        'Low Density Residential Densification Zone': 'R1A',
        'R1B-Rural residential zone': 'R1B',
        'Rural Residential Zone': 'R1B',
        'R2-Medium density residential - Improvement zone': 'R2',
        'Medium Density Residential - Improvement Zone': 'R2',
        'R3-Medium density residential - Expansion zone': 'R3',
        'Medium Density Residential - Expansion Zone': 'R3',
        'R4-High density residential zone': 'R4',
        'High Density Residential Zone': 'R4',
        
        // Commercial
        'C1-Mixed use zone': 'C1',
        'Mixed Use Zone': 'C1',
        'C3-City commercial zone': 'C3',
        'City Commercial Zone': 'C3',
        
        // Industrial
        'I1-Light industrial zone': 'I1',
        'Light Industrial Zone': 'I1',
        'I2-General industrial zone': 'I2',
        'General Industrial Zone': 'I2',
        'I3-Mining/ Extraction/Quarry': 'I3',
        
        // Public & Nature
        'P1-Parks and open spaces zone': 'P1',
        'P2-Sport and Eco tourism zone': 'P2',
        'P3B-Forest zone': 'P3B',
        'P3C-Steep slopes (> 30%) zone': 'P3C',
        'PA-Public Administration zone': 'PA',
        'PF1-Education and research facilities': 'PF1',
        'PF2-Health facilities': 'PF2',
        'PF3-Religious facilities': 'PF3',
        'PF4-Cultural/ memorial sites': 'PF4',
        'PF5-Cemetery/ crematoria': 'PF5',
        
        // Agriculture
        'A1-Agriculture zone': 'A1',
        'Agriculture Zone': 'A1',
        
        // Transport & Utility
        'T-Transportation zone': 'T',
        'Transportation Zone': 'T',
        'U-Utility zone': 'U',
        'Utility Zone': 'U',
        
        // Wetlands & Water
        'W2 - Rehabilitation': 'W2',
        'W3 - Sustainable Exploitation': 'W3',
        'W4 - Conservation': 'W4',
        'W5 - Recreational': 'W5',
        'WR-Waterbody zone': 'WR'
    };
    
    // Try direct match first
    if (normalizations[zoneName]) {
        return normalizations[zoneName];
    }
    
    // Try to extract code from zone name
    const codeMatch = zoneName.match(/^([A-Z]+[0-9]*[A-Z]?)/);
    if (codeMatch) {
        const code = codeMatch[1];
        if (ZONING_KNOWLEDGE_BASE[code]) {
            return code;
        }
    }
    
    return zoneName;
}

/**
 * Check if a specific use is permitted in a zone
 */
function isUsePermitted(zoneCode, useType) {
    const zone = getZoneInfo(zoneCode);
    if (!zone || !zone.uses) return { status: 'unknown', zone: zoneCode };
    
    const useLower = useType.toLowerCase();
    
    // Check permitted
    if (zone.uses.permitted) {
        for (const use of zone.uses.permitted) {
            if (use.toLowerCase().includes(useLower)) {
                return { status: 'permitted', use, zone: zone.fullName, article: zone.article };
            }
        }
    }
    
    // Check conditional
    if (zone.uses.conditional) {
        for (const use of zone.uses.conditional) {
            if (use.toLowerCase().includes(useLower)) {
                return { status: 'conditional', use, zone: zone.fullName, article: zone.article, note: 'Requires OSC approval' };
            }
        }
    }
    
    // Check prohibited
    if (zone.uses.prohibited) {
        for (const use of zone.uses.prohibited) {
            if (use.toLowerCase().includes(useLower)) {
                return { status: 'prohibited', use, zone: zone.fullName, article: zone.article };
            }
        }
    }
    
    return { status: 'not_specified', zone: zone.fullName };
}

/**
 * Get development parameters for a zone
 */
function getDevelopmentParams(zoneCode) {
    const zone = getZoneInfo(zoneCode);
    if (!zone) return null;
    
    return {
        zoneName: zone.fullName,
        code: zone.code,
        article: zone.article,
        table: zone.table,
        lotSize: zone.development?.lotSize,
        coverage: zone.development?.coverage,
        far: zone.development?.far,
        density: zone.development?.density,
        maxFloors: zone.building?.maxFloors,
        buildingForm: zone.building?.form
    };
}

module.exports = {
    ZONING_KNOWLEDGE_BASE,
    getZoneInfo,
    normalizeZoneName,
    isUsePermitted,
    getDevelopmentParams
};
