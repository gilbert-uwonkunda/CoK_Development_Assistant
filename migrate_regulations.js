// ============================================================================
// TERRANEBULAR REGULATIONS DATA MIGRATION
// Populates database with Kigali Master Plan 2050 + RFA Guidelines
// ============================================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// ============================================================================
// RESIDENTIAL ZONES DATA (From PDF Tables 6.1 - 6.6)
// ============================================================================

const RESIDENTIAL_ZONES = [
    {
        zone_code: 'R1',
        zone_name: 'Low Density Residential Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.40,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 0.5,
        density_min_single_use: 10,
        density_max_single_use: 15,
        density_min_mixed_use: 7,
        density_max_mixed_use: 10,
        max_floors: 'G+1+P',
        max_floors_ancillary: 'G',
        min_lot_size_sqm: null,
        max_lot_size_sqm: 500,
        setback_front_principal: 5,
        setback_front_secondary: 3,
        setback_rear: 3,
        setback_side: 1.5,
        building_forms: ['Detached', 'Semi-detached'],
        development_strategies: ['Individual plot development', 'Land subdivision', 'Estate'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        accessory_residential_units_allowed: true,
        regulation_page_reference: 'Table 6.1, Page 47',
        general_description: 'Intended for villa and bungalow typology with complementary public facilities. Limited in Kigali to existing consolidated areas.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing. Roof colours should blend with landscape.',
    },
    {
        zone_code: 'R1A',
        zone_name: 'Low Density Residential Densification Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.50,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 1.0,
        density_min_single_use: 20,
        density_max_single_use: 30,
        density_min_mixed_use: 15,
        density_max_mixed_use: 20,
        max_floors: 'G+2',
        max_floors_ancillary: 'G',
        min_lot_size_sqm: null,
        max_lot_size_sqm: 300,
        setback_front_principal: 5,
        setback_front_secondary: 3,
        setback_rear: 3,
        setback_side: 1.5,
        building_forms: ['Detached', 'Semi-detached', 'Attached'],
        development_strategies: ['Individual plot development', 'Land pooling', 'Land subdivision', 'Estate development'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        accessory_residential_units_allowed: true,
        regulation_page_reference: 'Table 6.2, Page 50',
        general_description: 'For semidetached houses, townhouses, multifamily houses, and low-rise developments. Promotes efficient use of land in prime areas.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing.',
    },
    {
        zone_code: 'R1B',
        zone_name: 'Rural Residential Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.60,
        landscaping_coverage_min: null,
        floor_area_ratio_max: 1.2,
        density_min_single_use: 40,
        density_max_single_use: 70,
        density_min_mixed_use: 30,
        density_max_mixed_use: 50,
        max_floors: 'G+2',
        max_floors_ancillary: 'G',
        min_lot_size_sqm: null,
        max_lot_size_sqm: 100,
        setback_front_principal: 3,
        setback_front_secondary: 2,
        setback_rear: 2,
        setback_side: 1,
        building_forms: ['Detached bungalows', 'Semi-detached houses', 'Multifamily houses', 'Rowhouses'],
        development_strategies: ['Individual plot development', 'Land pooling', 'Land subdivision'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        accessory_residential_units_allowed: true,
        regulation_page_reference: 'Table 6.3, Page 55',
        general_description: 'Compact developments in rural areas. Low-rise, medium-density housing for farming community. Limits encroachment on agricultural land.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing.',
        lot_size_notes: 'Max 100m² for Row Housing. Multifamily houses allowed if meeting minimum density.',
    },
    {
        zone_code: 'R2',
        zone_name: 'Medium Density Residential - Improvement Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.60,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 1.4,
        density_min_single_use: 60,
        density_max_single_use: 100,
        density_min_mixed_use: 40,
        density_max_mixed_use: 70,
        max_floors: 'G+3',
        max_floors_ancillary: 'G',
        additional_floor_conditions: 'One extra floor may be allowed due to topographic conditions or to achieve required density',
        min_lot_size_sqm: null,
        max_lot_size_sqm: 200,
        setback_front_principal: 3,
        setback_front_secondary: 2,
        setback_rear: 2,
        setback_side: 1,
        building_forms: ['Rowhouses', 'Apartments (low rise)'],
        development_strategies: ['Infrastructure retrofitting', 'Infill development', 'Urban renewal through land pooling'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        micro_enterprise_allowed: true,
        accessory_residential_units_allowed: true,
        regulation_page_reference: 'Table 6.4, Page 60',
        general_description: 'For upgradation of unplanned settlements or redevelopment of urban renewal areas. Improves living conditions through upgrading or land assembly.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing.',
        lot_size_notes: 'Max 200m² for rowhouses. Apartments allowed if meeting minimum density.',
    },
    {
        zone_code: 'R3',
        zone_name: 'Medium Density Residential - Expansion Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.60,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 1.2,
        density_min_single_use: 50,
        density_max_single_use: 90,
        density_min_mixed_use: 40,
        density_max_mixed_use: 70,
        max_floors: 'G+2',
        max_floors_ancillary: 'G',
        additional_floor_conditions: 'One extra floor may be allowed due to topographic conditions or to achieve required density',
        min_lot_size_sqm: null,
        max_lot_size_sqm: 150,
        setback_front_principal: 3,
        setback_front_secondary: 2,
        setback_rear: 2,
        setback_side: 1,
        building_forms: ['Attached for rowhouses', 'Attached/semi-detached/detached apartments and multifamily houses'],
        development_strategies: ['Individual private development', 'Land pooling', 'Sites and services'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        micro_enterprise_allowed: true,
        accessory_residential_units_allowed: true,
        regulation_page_reference: 'Table 6.5, Page 64',
        general_description: 'For intensification and redevelopment of peri-urban and greenfield areas. Facilitates low-cost incremental housing for low-income population. Must meet affordability criteria.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing.',
        lot_size_notes: 'Max 100m² for incremental single-family, max 150m² for rowhouses.',
    },
    {
        zone_code: 'R4',
        zone_name: 'High Density Residential Zone',
        zone_category: 'Residential',
        building_coverage_max: 0.50,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 1.8,
        density_min_single_use: 80,
        density_max_single_use: 120,
        density_min_mixed_use: 60,
        density_max_mixed_use: 80,
        max_floors: 'G+4',
        max_floors_ancillary: 'G',
        additional_floor_conditions: 'One extra floor may be allowed due to topographic conditions or to achieve required density',
        min_lot_size_sqm: 750,
        max_lot_size_sqm: null,
        setback_front_principal: 5,
        setback_front_secondary: 3,
        setback_rear: 3,
        setback_side: 1.5,
        building_forms: ['Attached buildings', 'Detached buildings'],
        development_strategies: ['Individual development', 'Land pooling'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        micro_enterprise_allowed: true,
        regulation_page_reference: 'Table 6.6, Page 70',
        general_description: 'Well-planned medium-rise housing and apartment complexes with integrated commercial and public facilities. Minimum 750m² lot size.',
        roof_requirements: 'Roof pitch shall be less than 30%. No reflective metal roofing.',
        lot_size_notes: 'Plots smaller than 750m² can follow R2 regulations.',
    },
];

// ============================================================================
// COMMERCIAL ZONES DATA (From PDF Tables 6.7 - 6.9)
// ============================================================================

const COMMERCIAL_ZONES = [
    {
        zone_code: 'C1',
        zone_name: 'Mixed Use Zone',
        zone_category: 'Commercial',
        building_coverage_max: 0.60,
        landscaping_coverage_min: 0.10,
        floor_area_ratio_max: 1.6,
        density_min_single_use: null,
        density_max_single_use: null,
        min_lot_size_sqm: 500,
        max_lot_size_sqm: null,
        setback_front_principal: 3,
        setback_front_secondary: 2,
        setback_rear: 2,
        setback_side: 1,
        max_floors: 'G+4',
        max_floors_ancillary: 'G',
        additional_floor_conditions: 'Additional floors may be authorized along BRT, wetland front, and green connectors as per UD Plan',
        building_forms: ['Attached buildings', 'Detached buildings'],
        development_strategies: ['Individual development', 'Infill development', 'Land pooling'],
        gated_communities_allowed: false,
        incremental_development_allowed: true,
        home_occupation_allowed: true,
        regulation_page_reference: 'Table 6.7, Page 74',
        general_description: 'High flexibility in mix of uses. Continuity in ground level commercial with employment opportunities above. Offers goods, services, and living quarters.',
        lot_size_notes: 'Plots below 500m² in existing commercial nodes allowed if not less than 200m² with OSC approval.',
    },
    {
        zone_code: 'O-C2',
        zone_name: 'Neighbourhood Commercial Zone Overlay',
        zone_category: 'Commercial',
        building_coverage_max: null, // Varies by underlying zone
        landscaping_coverage_min: null,
        floor_area_ratio_max: null,
        min_lot_size_sqm: null,
        max_lot_size_sqm: null,
        max_floors: 'As per underlying zone',
        regulation_page_reference: 'Table 6.8, Page 78',
        general_description: 'Overlay zone applied to residential areas to allow neighborhood commercial uses. Applied to R2, R3 zones along arterial roads.',
    },
    {
        zone_code: 'C3',
        zone_name: 'City Commercial Zone',
        zone_category: 'Commercial',
        building_coverage_max: 0.70,
        landscaping_coverage_min: 0.10,
        floor_area_ratio_max: 2.0,
        min_lot_size_sqm: 1000,
        max_lot_size_sqm: null,
        setback_front_principal: 3,
        setback_front_secondary: 2,
        setback_rear: 2,
        setback_side: 0,
        max_floors: 'G+6',
        max_floors_ancillary: 'G',
        additional_floor_conditions: 'Additional floors may be authorized along BRT, wetland front, and green connectors as per UD Plan',
        building_forms: ['Attached buildings', 'Detached buildings', 'Semi-detached buildings'],
        development_strategies: ['Individual development', 'Land pooling'],
        regulation_page_reference: 'Table 6.9, Page 83',
        general_description: 'High-intensity commercial zone for city-level commercial activities. Higher building heights and densities allowed.',
    },
];

// ============================================================================
// INDUSTRIAL ZONES DATA (From PDF Tables 6.16 - 6.18)
// ============================================================================

const INDUSTRIAL_ZONES = [
    {
        zone_code: 'I1',
        zone_name: 'Light Industrial Zone',
        zone_category: 'Industrial',
        building_coverage_max: 0.60,
        landscaping_coverage_min: 0.15,
        floor_area_ratio_max: 1.5,
        min_lot_size_sqm: 1000,
        max_lot_size_sqm: null,
        setback_front_principal: 5,
        setback_rear: 5,
        setback_side: 3,
        max_floors: 'G+2',
        max_floors_ancillary: 'G',
        building_forms: ['Detached buildings', 'Attached buildings'],
        development_strategies: ['Individual development', 'Industrial park development'],
        regulation_page_reference: 'Table 6.16, Page 99',
        general_description: 'For light industrial activities with minimal environmental impact. Allows small-scale manufacturing and assembly.',
    },
    {
        zone_code: 'I2',
        zone_name: 'General Industrial Zone',
        zone_category: 'Industrial',
        building_coverage_max: 0.70,
        landscaping_coverage_min: 0.10,
        floor_area_ratio_max: 1.8,
        min_lot_size_sqm: 2000,
        max_lot_size_sqm: null,
        setback_front_principal: 10,
        setback_rear: 10,
        setback_side: 5,
        max_floors: 'G+3',
        max_floors_ancillary: 'G',
        building_forms: ['Detached buildings'],
        development_strategies: ['Industrial park development'],
        regulation_page_reference: 'Table 6.17, Page 104',
        general_description: 'For general industrial activities. Higher impact allowed with proper mitigation measures.',
    },
    {
        zone_code: 'I3',
        zone_name: 'Mining/Extraction/Quarry Industrial Zone',
        zone_category: 'Industrial',
        building_coverage_max: 0.50,
        landscaping_coverage_min: 0.20,
        floor_area_ratio_max: 0.5,
        min_lot_size_sqm: 5000,
        max_lot_size_sqm: null,
        max_floors: 'G+1',
        regulation_page_reference: 'Table 6.18, Page 107',
        general_description: 'For mining, extraction and quarrying activities. Strict environmental controls required.',
    },
];

// ============================================================================
// PARKS & OPEN SPACES (From PDF Tables 6.19 - 6.26)
// ============================================================================

const PARKS_ZONES = [
    {
        zone_code: 'P1',
        zone_name: 'Parks and Open Spaces Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.19, Page 109',
        general_description: 'Public parks and recreational open spaces within urban areas.',
    },
    {
        zone_code: 'P2',
        zone_name: 'Sports and Eco-Tourism Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.20, Page 111',
        general_description: 'Areas designated for sports facilities and eco-tourism activities.',
    },
    {
        zone_code: 'P3-A',
        zone_name: 'National Parks Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.21, Page 113',
        general_description: 'Protected national park areas.',
    },
    {
        zone_code: 'P3-B',
        zone_name: 'Forest Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.22, Page 115',
        general_description: 'Forest conservation and management zones.',
    },
    {
        zone_code: 'P3-C',
        zone_name: 'Steep Slopes Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.23, Page 117',
        general_description: 'Steep slopes (>30%) requiring special protection and management.',
    },
    {
        zone_code: 'P3-D',
        zone_name: 'Natural Conservation Zone',
        zone_category: 'Parks and Open Spaces',
        regulation_page_reference: 'Table 6.24, Page 118',
        general_description: 'Areas designated for natural habitat conservation.',
    },
    {
        zone_code: 'A',
        zone_name: 'Agricultural Zone',
        zone_category: 'Agriculture',
        regulation_page_reference: 'Table 6.25, Page 120',
        general_description: 'Areas designated for agricultural activities.',
    },
    {
        zone_code: 'W',
        zone_name: 'Wetland Zone',
        zone_category: 'Wetland',
        regulation_page_reference: 'Table 6.26, Page 122',
        general_description: 'Protected wetland areas with strict use restrictions.',
    },
    {
        zone_code: 'WB',
        zone_name: 'Waterbody Zone',
        zone_category: 'Waterbody',
        regulation_page_reference: 'Table 6.28, Page 131',
        general_description: 'Rivers, lakes and other water bodies.',
    },
    {
        zone_code: 'T',
        zone_name: 'Transportation Zone',
        zone_category: 'Transportation',
        regulation_page_reference: 'Table 6.29, Page 132',
        general_description: 'Roads, highways, and transportation infrastructure.',
    },
    {
        zone_code: 'U',
        zone_name: 'Utility Zone',
        zone_category: 'Utility',
        regulation_page_reference: 'Table 6.30, Page 133',
        general_description: 'Utilities and infrastructure installations.',
    },
];

// ============================================================================
// PUBLIC FACILITIES ZONES (From PDF Tables 6.10 - 6.15)
// ============================================================================

const PUBLIC_FACILITY_ZONES = [
    {
        zone_code: 'PA',
        zone_name: 'Public Administrative and Services Zone',
        zone_category: 'Public Administrative',
        regulation_page_reference: 'Table 6.10, Page 88',
        general_description: 'Government offices and public administration facilities.',
    },
    {
        zone_code: 'PF1',
        zone_name: 'Public Facilities Zone - Education and Research',
        zone_category: 'Public Facilities',
        regulation_page_reference: 'Table 6.11, Page 90',
        general_description: 'Schools, universities, research institutions.',
    },
    {
        zone_code: 'PF2',
        zone_name: 'Public Facilities Zone - Health',
        zone_category: 'Public Facilities',
        regulation_page_reference: 'Table 6.12, Page 92',
        general_description: 'Hospitals, clinics, health centers.',
    },
    {
        zone_code: 'PF3',
        zone_name: 'Public Facilities Zone - Religious',
        zone_category: 'Public Facilities',
        regulation_page_reference: 'Table 6.13, Page 94',
        general_description: 'Churches, mosques, temples and other religious facilities.',
    },
    {
        zone_code: 'PF4',
        zone_name: 'Public Facilities Zone - Cultural/Memorial',
        zone_category: 'Public Facilities',
        regulation_page_reference: 'Table 6.14, Page 96',
        general_description: 'Museums, cultural centers, memorial sites.',
    },
    {
        zone_code: 'PF5',
        zone_name: 'Public Facilities Zone - Cemetery/Crematoria',
        zone_category: 'Public Facilities',
        regulation_page_reference: 'Table 6.15, Page 98',
        general_description: 'Cemeteries and crematoria facilities.',
    },
];

// ============================================================================
// ZONE USE PERMISSIONS DATA
// ============================================================================

const ZONE_USES = {
    'R1': {
        permitted: [
            { name: 'Single family houses', description: 'Detached single-family residential units' },
            { name: 'Home Occupation', description: 'Small business operated from home with restrictions' },
        ],
        conditional: [
            { name: 'Uses as per R1A regulations', description: 'Higher density options available', authority: 'CoK OSC' },
            { name: 'Apartments exceeding G+2', description: 'Taller apartments with approval', authority: 'CoK OSC' },
            { name: 'Semi-Detached', description: 'Semi-detached housing units', authority: 'CoK OSC' },
            { name: 'Multifamily Houses', description: 'Multiple family units in one building', authority: 'CoK OSC' },
            { name: 'Restaurants, Guest houses, B&B, Hotels', description: 'Hospitality uses', authority: 'CoK OSC' },
            { name: 'Public facilities', description: 'When suggested by Public Facilities Overlay', authority: 'CoK OSC' },
            { name: 'Commercial Retail Facilities', description: 'When allowed by O-C2 Overlay', authority: 'CoK OSC' },
            { name: 'Accessory Residential Units', description: 'Additional dwelling units on property', authority: 'CoK OSC' },
        ],
        prohibited: [
            { name: 'Industrial uses', description: 'All industrial activities prohibited' },
            { name: 'Major infrastructure', description: 'Large infrastructure installations' },
        ],
    },
    'R4': {
        permitted: [
            { name: 'High density residential', description: 'Apartment buildings and complexes' },
            { name: 'Home Occupation', description: 'Small business operated from home' },
        ],
        conditional: [
            { name: 'Restaurants', description: 'Food service establishments', authority: 'CoK OSC' },
            { name: 'Hotels', description: 'Hotels including ancillary uses', authority: 'CoK OSC' },
            { name: 'Guest houses', description: 'Guest house accommodations', authority: 'CoK OSC' },
            { name: 'B&B', description: 'Bed and breakfast establishments', authority: 'CoK OSC' },
            { name: 'Public facilities', description: 'When allowed by public facilities overlay', authority: 'CoK OSC' },
            { name: 'Commercial retail', description: 'When allowed by O-C2 Overlay', authority: 'CoK OSC' },
            { name: 'Office', description: 'Commercial office space when allowed', authority: 'CoK OSC' },
            { name: 'Micro-Enterprise', description: 'Small business with up to 5 employees', authority: 'CoK OSC', conditions: ['Maximum 30% of floor area', 'Ground floor only', 'No exterior changes'] },
        ],
        prohibited: [
            { name: 'Industrial uses', description: 'All industrial activities' },
            { name: 'Major infrastructure', description: 'Large infrastructure installations' },
        ],
    },
    'C1': {
        permitted: [
            { name: 'Commercial / Retail', description: 'Shops, stores, commercial services' },
            { name: 'Restaurants and Recreational activities', description: 'Food service and entertainment' },
            { name: 'Office use above 1st floor', description: 'Office space on upper floors' },
            { name: 'Co-working spaces', description: 'Shared office facilities' },
            { name: 'Residential', description: 'Residential units in mixed-use buildings' },
            { name: 'Home Occupation', description: 'Business operated from residential unit' },
        ],
        conditional: [
            { name: 'Public Facilities', description: 'Schools, hospitals, etc.', authority: 'CoK OSC' },
            { name: 'Transportation Terminals', description: 'Bus stations, transport hubs', authority: 'CoK OSC' },
            { name: 'Hotels', description: 'Hotel developments', authority: 'CoK OSC' },
            { name: 'Petrol stations', description: 'Fuel service stations', authority: 'CoK OSC' },
            { name: 'Garages and Car Repair', description: 'Grade E as per RBS requirements', authority: 'CoK OSC', conditions: ['Must comply with RS 402', 'Waste management per RS 368', 'No activities on public roads'] },
            { name: 'Car Wash Services', description: 'Vehicle washing facilities', authority: 'CoK OSC', conditions: ['Proper waste water management', 'No street operations'] },
        ],
        prohibited: [
            { name: 'Large scale commercial complex', description: 'Mega malls and large complexes' },
            { name: 'Industrial Uses', description: 'Manufacturing and industrial activities' },
            { name: 'Major Infrastructure Installations', description: 'Heavy infrastructure' },
        ],
    },
};

// ============================================================================
// RFA TREE REQUIREMENTS BY ZONE
// ============================================================================

const TREE_REQUIREMENTS = [
    {
        zone_code: 'R1',
        zone_category_rfa: 'Residential R1-R4',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: 'Individual placement based on available space',
        setback_from_building_meters: '5-10m',
        max_tree_height_meters: 15,
        preferred_canopy_form: ['Moderate size', 'Non-invasive roots'],
        primary_purposes: ['Shade', 'Aesthetic', 'Biodiversity'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year (start and end of rainy season)',
        pruning_frequency: 'Once or twice annually',
        rooftop_gardens_allowed: true,
        ground_gardens_allowed: true,
        guideline_table_reference: 'Table 6, Page 13',
    },
    {
        zone_code: 'R2',
        zone_category_rfa: 'Residential R1-R4',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: 'Individual placement',
        setback_from_building_meters: '5-10m',
        max_tree_height_meters: 15,
        preferred_canopy_form: ['Moderate size'],
        primary_purposes: ['Shade', 'Aesthetic', 'Biodiversity'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Once or twice annually',
        rooftop_gardens_allowed: true,
        ground_gardens_allowed: true,
        guideline_table_reference: 'Table 6, Page 13',
    },
    {
        zone_code: 'R3',
        zone_category_rfa: 'Residential R1-R4',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: 'Individual placement',
        setback_from_building_meters: '5-10m',
        max_tree_height_meters: 15,
        preferred_canopy_form: ['Moderate size'],
        primary_purposes: ['Shade', 'Aesthetic', 'Biodiversity'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Once or twice annually',
        rooftop_gardens_allowed: true,
        ground_gardens_allowed: true,
        guideline_table_reference: 'Table 6, Page 13',
    },
    {
        zone_code: 'R4',
        zone_category_rfa: 'Residential R1-R4',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: 'Individual placement',
        setback_from_building_meters: '5-10m',
        max_tree_height_meters: 15,
        preferred_canopy_form: ['Moderate size'],
        primary_purposes: ['Shade', 'Aesthetic', 'Biodiversity'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Once or twice annually',
        rooftop_gardens_allowed: true,
        ground_gardens_allowed: true,
        guideline_table_reference: 'Table 6, Page 13',
    },
    {
        zone_code: 'C1',
        zone_category_rfa: 'Commercial C1-C3',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: '5-7m for ornamentals, 5-8m for fruit trees',
        primary_purposes: ['Shade', 'Aesthetic', 'Air quality', 'Productivity'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Once or twice annually',
        ground_gardens_allowed: true,
        street_trees_allowed: true,
        guideline_table_reference: 'Table 9, Page 16',
    },
    {
        zone_code: 'I1',
        zone_category_rfa: 'Industrial I1-I3',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: '2-3m for live fences',
        primary_purposes: ['Air purification', 'Screening', 'Noise reduction'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        special_notes: 'Live fences recommended to capture emissions',
        guideline_table_reference: 'Table 9, Page 16',
    },
    {
        zone_code: 'P1',
        zone_category_rfa: 'Parks P1-P3B',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: '8-12m for tall trees, 5-6m for fruit trees, 1.5-3m for shrubs',
        planting_density_per_100sqm: null,
        primary_purposes: ['Biodiversity', 'Recreation', 'Ecosystem services', 'Aesthetic'],
        watering_frequency: 'Regular irrigation until established',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Regular maintenance for safety and health',
        guideline_table_reference: 'Table 11-12, Pages 18-20',
    },
    {
        zone_code: 'T',
        zone_category_rfa: 'Roadside',
        min_native_species_percentage: 0.50,
        recommended_spacing_meters: '3m x 3m',
        setback_from_road_meters: 2,
        max_tree_height_meters: null,
        preferred_canopy_form: ['Columnar', 'Pyramidal (3-6m diameter)', 'Oval', 'Rounded (6-9m diameter)'],
        primary_purposes: ['Erosion control', 'Beautification', 'Shade', 'Soil stabilization'],
        watering_frequency: '2-3 times per week in dry season',
        fertilization_schedule: 'Twice a year',
        pruning_frequency: 'Once or twice annually',
        special_notes: 'Avoid trees >2m height under power lines. No blocking road signs or visibility',
        guideline_table_reference: 'Table 3-5, Pages 9-11',
    },
];

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateZoneRegulations() {
    console.log('\n📋 Migrating Zone Regulations...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const allZones = [
            ...RESIDENTIAL_ZONES,
            ...COMMERCIAL_ZONES,
            ...INDUSTRIAL_ZONES,
            ...PARKS_ZONES,
            ...PUBLIC_FACILITY_ZONES
        ];
        
        for (const zone of allZones) {
            const query = `
                INSERT INTO zone_regulations (
                    zone_code, zone_name, zone_category,
                    building_coverage_max, building_coverage_min, landscaping_coverage_min,
                    floor_area_ratio_max,
                    density_min_single_use, density_max_single_use,
                    density_min_mixed_use, density_max_mixed_use,
                    max_floors, max_floors_ancillary, additional_floor_conditions,
                    min_lot_size_sqm, max_lot_size_sqm, lot_size_notes,
                    setback_front_principal, setback_front_secondary, setback_rear, setback_side, setback_notes,
                    building_forms, development_strategies,
                    gated_communities_allowed, incremental_development_allowed,
                    home_occupation_allowed, micro_enterprise_allowed, accessory_residential_units_allowed,
                    regulation_page_reference, general_description, roof_requirements, special_notes
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                    $27, $28, $29, $30, $31, $32, $33
                )
                ON CONFLICT (zone_code) DO UPDATE SET
                    zone_name = EXCLUDED.zone_name,
                    building_coverage_max = EXCLUDED.building_coverage_max,
                    last_updated = NOW()
            `;
            
            await client.query(query, [
                zone.zone_code, zone.zone_name, zone.zone_category,
                zone.building_coverage_max, zone.building_coverage_min, zone.landscaping_coverage_min,
                zone.floor_area_ratio_max,
                zone.density_min_single_use, zone.density_max_single_use,
                zone.density_min_mixed_use, zone.density_max_mixed_use,
                zone.max_floors, zone.max_floors_ancillary, zone.additional_floor_conditions,
                zone.min_lot_size_sqm, zone.max_lot_size_sqm, zone.lot_size_notes,
                zone.setback_front_principal, zone.setback_front_secondary,
                zone.setback_rear, zone.setback_side, zone.setback_notes,
                zone.building_forms, zone.development_strategies,
                zone.gated_communities_allowed || false,
                zone.incremental_development_allowed || false,
                zone.home_occupation_allowed || false,
                zone.micro_enterprise_allowed || false,
                zone.accessory_residential_units_allowed || false,
                zone.regulation_page_reference, zone.general_description,
                zone.roof_requirements, zone.special_notes
            ]);
            
            console.log(`  ✓ ${zone.zone_code} - ${zone.zone_name}`);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated ${allZones.length} zone regulations`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating zone regulations:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function migrateZoneUses() {
    console.log('\n🏗️  Migrating Zone Use Permissions...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        let totalUses = 0;
        for (const [zoneCode, uses] of Object.entries(ZONE_USES)) {
            // Permitted uses
            for (const use of uses.permitted) {
                await client.query(`
                    INSERT INTO zone_use_permissions (zone_code, use_type, use_name, use_description)
                    VALUES ($1, 'permitted', $2, $3)
                `, [zoneCode, use.name, use.description]);
                totalUses++;
            }
            
            // Conditional uses
            for (const use of uses.conditional) {
                await client.query(`
                    INSERT INTO zone_use_permissions (zone_code, use_type, use_name, use_description, approval_authority, approval_conditions)
                    VALUES ($1, 'conditional', $2, $3, $4, $5)
                `, [zoneCode, use.name, use.description, use.authority, use.conditions || null]);
                totalUses++;
            }
            
            // Prohibited uses
            for (const use of uses.prohibited) {
                await client.query(`
                    INSERT INTO zone_use_permissions (zone_code, use_type, use_name, use_description)
                    VALUES ($1, 'prohibited', $2, $3)
                `, [zoneCode, use.name, use.description]);
                totalUses++;
            }
            
            console.log(`  ✓ ${zoneCode}: ${uses.permitted.length} permitted, ${uses.conditional.length} conditional, ${uses.prohibited.length} prohibited`);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated ${totalUses} use permissions`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating zone uses:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function migrateTreeRequirements() {
    console.log('\n🌳 Migrating Tree Requirements...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const req of TREE_REQUIREMENTS) {
            const query = `
                INSERT INTO zone_tree_requirements (
                    zone_code, zone_category_rfa,
                    min_native_species_percentage, recommended_spacing_meters,
                    planting_density_per_100sqm,
                    setback_from_road_meters, setback_from_building_meters,
                    max_tree_height_meters, preferred_canopy_form,
                    primary_purposes,
                    watering_frequency, fertilization_schedule, pruning_frequency,
                    rooftop_gardens_allowed, ground_gardens_allowed, street_trees_allowed,
                    guideline_table_reference
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
                )
                ON CONFLICT (zone_code) DO UPDATE SET
                    min_native_species_percentage = EXCLUDED.min_native_species_percentage,
                    recommended_spacing_meters = EXCLUDED.recommended_spacing_meters
            `;
            
            await client.query(query, [
                req.zone_code, req.zone_category_rfa,
                req.min_native_species_percentage, req.recommended_spacing_meters,
                req.planting_density_per_100sqm,
                req.setback_from_road_meters, req.setback_from_building_meters,
                req.max_tree_height_meters, req.preferred_canopy_form,
                req.primary_purposes,
                req.watering_frequency, req.fertilization_schedule, req.pruning_frequency,
                req.rooftop_gardens_allowed || false,
                req.ground_gardens_allowed || false,
                req.street_trees_allowed || false,
                req.guideline_table_reference
            ]);
            
            console.log(`  ✓ ${req.zone_code} - ${req.zone_category_rfa}`);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated ${TREE_REQUIREMENTS.length} tree requirements`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating tree requirements:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Add this to the END of your migrate_regulations.js file
// (after all the data arrays and migration functions)

async function runMigration() {
    console.log('========================================');
    console.log('TerraNebular Regulations Migration');
    console.log('Kigali Master Plan 2050 + RFA Guidelines');
    console.log('========================================\n');
    
    try {
        // Step 1: Migrate zone regulations
        await migrateZoneRegulations();
        
        // Step 2: Migrate use permissions
        await migrateZoneUses();
        
        // Step 3: Migrate tree requirements
        await migrateTreeRequirements();
        
        // Step 4: Sample tree species
        await migrateTreeSpeciesSample();
        
        console.log('\n========================================');
        console.log('Migration Complete!');
        console.log('========================================');
        console.log('\nNext steps:');
        console.log('1. Review migrated data: SELECT * FROM zone_regulations;');
        console.log('2. Test queries in spatialService.js');
        console.log('3. Update Claude prompts with real data\n');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function migrateTreeSpeciesSample() {
    console.log('\n🌲 Migrating Sample Tree Species...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const species of TREE_SPECIES_SAMPLE) {
            const query = `
                INSERT INTO tree_species_catalog (
                    scientific_name, local_name_kinyarwanda, common_name_english,
                    is_native, is_exotic,
                    suitable_lowland, suitable_midland, suitable_highland,
                    suitable_roadside, suitable_open_space, suitable_residential,
                    suitable_productive_forest, suitable_protective_forest, suitable_rooftop,
                    mature_height_meters, canopy_form, growth_rate,
                    provides_shade, provides_fruit, provides_timber,
                    drought_tolerant
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21
                )
                ON CONFLICT (scientific_name) DO NOTHING
            `;
            
            await client.query(query, [
                species.scientific_name,
                species.local_name,
                species.common_name_english,
                species.is_native || false,
                species.is_exotic || false,
                species.suitable_lowland || false,
                species.suitable_midland || false,
                species.suitable_highland || false,
                species.suitable_roadside || false,
                species.suitable_open_space || false,
                species.suitable_residential || false,
                species.suitable_productive_forest || false,
                species.suitable_protective_forest || false,
                species.suitable_rooftop || false,
                species.mature_height_meters,
                species.canopy_form,
                species.growth_rate,
                species.provides_shade || false,
                species.provides_fruit || false,
                species.provides_timber || false,
                species.drought_tolerant || false
            ]);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated ${TREE_SPECIES_SAMPLE.length} sample tree species`);
        console.log('   (Add remaining 200+ species from RFA Appendix manually)');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating tree species:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('\n✅ All done! Database is ready.\n');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Fatal error:', error);
            process.exit(1);
        });
}

module.exports = {
    runMigration,
    migrateZoneRegulations,
    migrateZoneUses,
    migrateTreeRequirements,
};