#!/bin/bash

# PrimeNG v17 to v18 Migration Bash Script
# This script provides interactive migration utilities for PrimeNG v17 to v18

# Text formatting
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed or not available in PATH${NC}"
    exit 1
fi

# Function to check for unstaged changes
check_unstaged_changes() {
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}There are unstaged changes in the repository.${NC}"
        read -p "Do you want to stash these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Stashing changes..."
            if ! git stash; then
                echo -e "${RED}Failed to stash changes. Exiting...${NC}"
                exit 1
            fi
            echo -e "${GREEN}Changes stashed successfully.${NC}"
        else
            echo -e "${RED}Exiting migration script. Please commit or stash your changes before running the migration.${NC}"
            exit 1
        fi
    fi
}

# Function to commit changes
commit_changes() {
    local commit_msg="$1"
    git add .
    git commit -m "$commit_msg"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Changes committed with message: ${commit_msg}${NC}"
        return 0
    else
        echo -e "${RED}Failed to commit changes${NC}"
        return 1
    fi
}

# Function to find and replace in files
find_and_replace() {
    local pattern="$1"
    local replacement="$2"
    local file_pattern="$3"
    local commit_msg="$4"
    
    # Find files with the pattern
    files=$(grep -l "$pattern" $(find src -type f -name "$file_pattern" 2>/dev/null) 2>/dev/null)
    
    if [ -z "$files" ]; then
        echo -e "${YELLOW}No files found containing the pattern.${NC}"
        return 0
    fi
    
    # Count files
    file_count=$(echo "$files" | wc -l)
    
    echo -e "${BLUE}Found $file_count files with matching pattern:${NC}"
    echo "$files"
    
    # Confirm replacement
    read -p "Do you want to proceed with the replacement? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Perform the replacement
        echo "Performing replacements..."
        
        for file in $files; do
            sed -i "s|$pattern|$replacement|g" "$file"
        done
        
        # Commit changes
        commit_changes "$commit_msg"
        return $?
    else
        echo "Skipping this replacement."
        return 0
    fi
}

# Main menu
show_menu() {
    echo -e "\n${BOLD}PrimeNG v17 to v18 Migration Script${NC}"
    echo -e "===================================\n"
    echo -e "Available migrations:"
    echo -e "1. ${BLUE}Update Module Imports${NC} - Update import paths for renamed PrimeNG modules"
    echo -e "2. ${BLUE}Update Component Selectors${NC} - Update HTML template component selectors"
    echo -e "3. ${BLUE}Update CSS Classes${NC} - Update deprecated CSS classes"
    echo -e "4. ${BLUE}Update Component Properties${NC} - Update changed component properties"
    echo -e "5. ${BLUE}Update Dialog Component${NC} - Update Dialog component API changes"
    echo -e "6. ${BLUE}Update SelectButton Component${NC} - Update SelectButton component"
    echo -e "7. ${BLUE}Update Interface Names${NC} - Update Message to ToastMessageOptions"
    echo -e "8. ${BLUE}Update Directives${NC} - Update pAnimate to pAnimateOnScroll"
    echo -e "9. ${BLUE}Update Package Dependencies${NC} - Update PrimeNG and PrimeFlex versions"
    echo -e "10. ${BLUE}Update Theme Imports${NC} - Remove deprecated theme imports"
    echo -e "11. ${BLUE}Run All Migrations${NC}"
    echo -e "0. ${RED}Exit${NC}\n"
    
    read -p "Select an option (0-11): " option
    handle_option $option
}

# Update module imports
update_module_imports() {
    echo -e "\n${BOLD}Updating Module Imports${NC}"
    
    # Calendar to DatePicker
    find_and_replace "import.*from 'primeng/calendar'" "import { DatePickerModule } from 'primeng/datepicker'" "*.ts" "refactor(primeng): update Calendar imports to DatePicker for v18"
    
    # Dropdown to Select
    find_and_replace "import.*from 'primeng/dropdown'" "import { SelectModule } from 'primeng/select'" "*.ts" "refactor(primeng): update Dropdown imports to Select for v18"
    
    # InputSwitch to ToggleSwitch
    find_and_replace "import.*from 'primeng/inputswitch'" "import { ToggleSwitchModule } from 'primeng/toggleswitch'" "*.ts" "refactor(primeng): update InputSwitch imports to ToggleSwitch for v18"
    
    # OverlayPanel to Popover
    find_and_replace "import.*from 'primeng/overlaypanel'" "import { PopoverModule } from 'primeng/popover'" "*.ts" "refactor(primeng): update OverlayPanel imports to Popover for v18"
    
    # Sidebar to Drawer
    find_and_replace "import.*from 'primeng/sidebar'" "import { DrawerModule } from 'primeng/drawer'" "*.ts" "refactor(primeng): update Sidebar imports to Drawer for v18"
    
    # Module class names
    find_and_replace "\\bCalendarModule\\b" "DatePickerModule" "*.ts" "refactor(primeng): update CalendarModule to DatePickerModule for v18"
    find_and_replace "\\bDropdownModule\\b" "SelectModule" "*.ts" "refactor(primeng): update DropdownModule to SelectModule for v18"
    find_and_replace "\\bInputSwitchModule\\b" "ToggleSwitchModule" "*.ts" "refactor(primeng): update InputSwitchModule to ToggleSwitchModule for v18"
    find_and_replace "\\bOverlayPanelModule\\b" "PopoverModule" "*.ts" "refactor(primeng): update OverlayPanelModule to PopoverModule for v18"
    find_and_replace "\\bSidebarModule\\b" "DrawerModule" "*.ts" "refactor(primeng): update SidebarModule to DrawerModule for v18"
    
    show_menu
}

# Update component selectors
update_component_selectors() {
    echo -e "\n${BOLD}Updating Component Selectors${NC}"
    
    # Calendar to DatePicker
    find_and_replace "<p-calendar" "<p-datepicker" "*.html" "refactor(primeng): update p-calendar to p-datepicker for v18"
    find_and_replace "</p-calendar>" "</p-datepicker>" "*.html" "refactor(primeng): update p-calendar closing tag to p-datepicker for v18"
    
    # Dropdown to Select
    find_and_replace "<p-dropdown" "<p-select" "*.html" "refactor(primeng): update p-dropdown to p-select for v18"
    find_and_replace "</p-dropdown>" "</p-select>" "*.html" "refactor(primeng): update p-dropdown closing tag to p-select for v18"
    
    # InputSwitch to ToggleSwitch
    find_and_replace "<p-inputSwitch" "<p-toggleSwitch" "*.html" "refactor(primeng): update p-inputSwitch to p-toggleSwitch for v18"
    find_and_replace "</p-inputSwitch>" "</p-toggleSwitch>" "*.html" "refactor(primeng): update p-inputSwitch closing tag to p-toggleSwitch for v18"
    
    # OverlayPanel to Popover
    find_and_replace "<p-overlayPanel" "<p-popover" "*.html" "refactor(primeng): update p-overlayPanel to p-popover for v18"
    find_and_replace "</p-overlayPanel>" "</p-popover>" "*.html" "refactor(primeng): update p-overlayPanel closing tag to p-popover for v18"
    
    # Sidebar to Drawer
    find_and_replace "<p-sidebar" "<p-drawer" "*.html" "refactor(primeng): update p-sidebar to p-drawer for v18"
    find_and_replace "</p-sidebar>" "</p-drawer>" "*.html" "refactor(primeng): update p-sidebar closing tag to p-drawer for v18"
    
    # SelectButton case fix
    find_and_replace "p-selectButton" "p-selectbutton" "*.html" "refactor(primeng): update SelectButton element naming for v18"
    
    show_menu
}

# Update CSS classes
update_css_classes() {
    echo -e "\n${BOLD}Updating CSS Classes${NC}"
    
    # p-component to p-element
    find_and_replace "p-component" "p-element" "*.{html,scss,css}" "refactor(primeng): update p-component to p-element for v18"
    
    # p-inputtext to p-input
    find_and_replace "p-inputtext" "p-input" "*.{html,scss,css}" "refactor(primeng): update p-inputtext to p-input for v18"
    
    # Remove deprecated utility classes
    find_and_replace "\\bp-link\\b" "" "*.{html,scss,css}" "refactor(primeng): remove p-link class (removed in v18)"
    find_and_replace "\\bp-highlight\\b" "" "*.{html,scss,css}" "refactor(primeng): remove p-highlight class (removed in v18)"
    find_and_replace "\\bp-fluid\\b" "" "*.{html,scss,css}" "refactor(primeng): remove p-fluid class (removed in v18)"
    
    show_menu
}

# Update component properties
update_component_properties() {
    echo -e "\n${BOLD}Updating Component Properties${NC}"
    
    # Update transition options syntax
    find_and_replace '\\[showTransitionOptions\\]="[^"]*"' '[showTransitionOptions]="'"'"'.12s'"'"'"' "*.html" "refactor(primeng): update showTransitionOptions syntax for v18"
    find_and_replace '\\[hideTransitionOptions\\]="[^"]*"' '[hideTransitionOptions]="'"'"'.12s'"'"'"' "*.html" "refactor(primeng): update hideTransitionOptions syntax for v18"
    
    show_menu
}

# Update Dialog component
update_dialog_component() {
    echo -e "\n${BOLD}Updating Dialog Component${NC}"
    
    # Update modal property to closeOnEscape
    find_and_replace "\\[modal\\]" "[closeOnEscape]" "*.html" "refactor(primeng): update Dialog modal to closeOnEscape for v18"
    
    show_menu
}

# Update SelectButton component
update_select_button() {
    echo -e "\n${BOLD}Updating SelectButton Component${NC}"
    
    # Update SelectButton element naming
    find_and_replace "p-selectButton" "p-selectbutton" "*.html" "refactor(primeng): update SelectButton element naming for v18"
    
    show_menu
}

# Update interface names
update_interface_names() {
    echo -e "\n${BOLD}Updating Interface Names${NC}"
    
    # Update Message to ToastMessageOptions
    find_and_replace "import.*Message.*from 'primeng/api'" "import { ToastMessageOptions } from 'primeng/api'" "*.ts" "refactor(primeng): update Message interface to ToastMessageOptions for v18"
    find_and_replace "\\bMessage\\b" "ToastMessageOptions" "*.ts" "refactor(primeng): update Message type to ToastMessageOptions for v18"
    
    show_menu
}

# Update directives
update_directives() {
    echo -e "\n${BOLD}Updating Directives${NC}"
    
    # Update pAnimate to pAnimateOnScroll
    find_and_replace "\\bpAnimate\\b" "pAnimateOnScroll" "*.html" "refactor(primeng): update pAnimate directive to pAnimateOnScroll for v18"
    
    # Remove p-defer component
    find_and_replace "<p-defer[^>]*>.*</p-defer>" "<!-- p-defer is removed in PrimeNG v18. Consider using Angular @defer instead -->" "*.html" "refactor(primeng): remove p-defer (deprecated in v18, use Angular @defer)"
    
    show_menu
}

# Update package dependencies
update_package_dependencies() {
    echo -e "\n${BOLD}Updating Package Dependencies${NC}"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}package.json not found. Skipping dependency updates.${NC}"
        show_menu
        return
    fi
    
    # Update PrimeNG version
    read -p "Do you want to update PrimeNG to v18.0.0? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Use temporary files to update package.json safely
        # Use jq if available, otherwise fallback to sed
        if command -v jq &> /dev/null; then
            jq '.dependencies.primeng = "^18.0.0"' package.json > package.json.tmp && mv package.json.tmp package.json
        else
            sed -i 's/"primeng": "[^"]*"/"primeng": "^18.0.0"/g' package.json
        fi
        echo -e "${GREEN}Updated PrimeNG to v18.0.0 in package.json${NC}"
        commit_changes "chore(deps): update primeng to v18.0.0"
    fi
    
    # Update PrimeFlex version if present
    if grep -q '"primeflex"' package.json; then
        read -p "Do you want to update PrimeFlex to v4.0.0? (required for PrimeNG v18) (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v jq &> /dev/null; then
                jq '.dependencies.primeflex = "^4.0.0"' package.json > package.json.tmp && mv package.json.tmp package.json
            else
                sed -i 's/"primeflex": "[^"]*"/"primeflex": "^4.0.0"/g' package.json
            fi
            echo -e "${GREEN}Updated PrimeFlex to v4.0.0 in package.json${NC}"
            commit_changes "chore(deps): update primeflex to v4 for primeng v18 compatibility"
        fi
    else
        echo -e "${YELLOW}PrimeFlex not found in dependencies. Skipping PrimeFlex update.${NC}"
    fi
    
    show_menu
}

# Update theme imports
update_theme_imports() {
    echo -e "\n${BOLD}Updating Theme Imports${NC}"
    
    # Check if angular.json exists
    if [ ! -f "angular.json" ]; then
        echo -e "${RED}angular.json not found. Skipping theme import updates.${NC}"
        show_menu
        return
    fi
    
    read -p "Do you want to remove deprecated PrimeNG theme imports from angular.json? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create backup
        cp angular.json angular.json.bak
        
        # Use a temporary file for sed processing
        sed -i '/primeng\/resources/d' angular.json
        
        echo -e "${GREEN}Removed deprecated PrimeNG theme imports from angular.json${NC}"
        echo -e "${YELLOW}Note: You may need to add new theme imports manually. See the PrimeNG v18 documentation.${NC}"
        commit_changes "refactor(primeng): remove deprecated theme imports for v18"
    fi
    
    show_menu
}

# Run all migrations
run_all_migrations() {
    echo -e "\n${BOLD}Running All Migrations${NC}"
    
    # Check with user before proceeding
    read -p "This will run all migration steps. Are you sure you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        show_menu
        return
    fi
    
    update_package_dependencies
    update_theme_imports
    update_module_imports
    update_component_selectors
    update_css_classes
    update_component_properties
    update_dialog_component
    update_select_button
    update_interface_names
    update_directives
    
    echo -e "\n${GREEN}All migrations completed.${NC}"
    echo -e "${YELLOW}Reminder: You may need to manually update:${NC}"
    echo -e "1. PrimeNG Configuration (replace PrimeNGConfig with providePrimeNG())"
    echo -e "2. Add new theme imports if you removed the deprecated ones"
    echo -e "3. Run npm install to install the updated dependencies"
    
    exit 0
}

# Handle menu options
handle_option() {
    case $1 in
        1) update_module_imports ;;
        2) update_component_selectors ;;
        3) update_css_classes ;;
        4) update_component_properties ;;
        5) update_dialog_component ;;
        6) update_select_button ;;
        7) update_interface_names ;;
        8) update_directives ;;
        9) update_package_dependencies ;;
        10) update_theme_imports ;;
        11) run_all_migrations ;;
        0) echo -e "${GREEN}Exiting...${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}"; show_menu ;;
    esac
}

# Main entry point - check unstaged changes and show menu
check_unstaged_changes
show_menu