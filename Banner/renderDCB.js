//Change below as per the Environment
API_BASE_URL = 'https://aws-demo-idp.datasafeguard.ai/pmp/cmp/';
API_FETCH_BANNER = "get_dcb_info";
API_POST_PAYLOAD = "store_dcb_payload"
var selectedLanguage = 'default';
var globalConfig;

// Show a loading spinner inside the container
/**
 * Loadingmstate when the Form Display data is fetched
 * @param {*} containerID 
 * @returns void
 */
function showLoadingSpinner(containerID) {
    const container = document.getElementById(containerID);
    if (!container) return;

    // Avoid duplicating spinner
    if (container.querySelector('.dcb-loading-spinner')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dcb-loading-spinner';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = '24px';

    const spinner = document.createElement('div');
    spinner.style.width = '24px';
    spinner.style.height = '24px';
    spinner.style.border = '3px solid #e5e7eb';
    spinner.style.borderTop = '3px solid #3b82f6';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'dcb-spin 0.8s linear infinite';

    const label = document.createElement('span');
    label.textContent = 'Loading...';
    label.style.marginLeft = '12px';
    label.style.fontSize = '14px';
    label.style.color = '#4b5563';

    wrapper.appendChild(spinner);
    wrapper.appendChild(label);
    container.appendChild(wrapper);

    // Inject keyframes once
    if (!document.getElementById('dcb-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'dcb-spinner-style';
        style.textContent = `
        @keyframes dcb-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }`;
        document.head.appendChild(style);
    }
}

// Hide loading spinner from the container
function hideLoadingSpinner(containerID) {
    const container = document.getElementById(containerID);
    if (!container) return;
    const spinner = container.querySelector('.dcb-loading-spinner');
    if (spinner) {
        container.removeChild(spinner);
    }
}

// Function to create and append the translation element
function createTranslationElement(config, containerID, bannerID) {
    // Create container
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.right = '0px';
    container.style.top = "0px";
    container.style.padding = "6px 10px 5px 15px";
    container.style.backgroundColor = "white";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "15px";
    container.style.display = 'inline-block';
    container.style.color = '#000';

    const clickContainer = document.createElement('div');
    clickContainer.style.display = "flex";
    clickContainer.style.justifyContent = "space-between";
    clickContainer.style.alignItems = "center";
    // Create icon
    const icon = document.createElement('img');
    icon.src = 'https://cdn-icons-png.flaticon.com/128/2875/2875427.png'; // Replace with your image path
    icon.alt = 'Translate';
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.cursor = 'pointer';
    icon.style.marginRight = '5px';

    const caretIcon = document.createElement('img');
    caretIcon.src = 'https://cdn-icons-png.flaticon.com/128/9053/9053032.png';
    caretIcon.alt = 'Translate';
    caretIcon.style.width = '20px';
    caretIcon.style.height = '20px';
    caretIcon.style.cursor = 'pointer';
    caretIcon.style.marginLeft = '5px';

    const label = document.createElement('span');
    label.textContent = selectedLanguage === 'default' ? 'English' : selectedLanguage;
    clickContainer.appendChild(icon);
    clickContainer.appendChild(label);
    clickContainer.appendChild(caretIcon);
    container.appendChild(clickContainer);

    // Create language options list
    const options = document.createElement('ul');
    options.style.display = 'none';
    options.style.position = 'absolute';
    options.style.top = '35px';
    options.style.left = '0';
    options.style.listStyle = 'none';
    options.style.margin = '0';
    options.style.padding = '0';
    options.style.backgroundColor = 'white';
    options.style.border = '1px solid #ccc';
    //options.style.borderRadius = "10px";
    options.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    options.style.zIndex = '1000';


    // Add language options
    const languages = Object.keys(config);
    languages.forEach((language) => {
        const option = document.createElement('li');
        option.textContent = language === 'default' ? 'English' : language;
        option.style.padding = '10px 15px';
        option.style.cursor = 'pointer';
        option.style.whiteSpace = 'nowrap';

        // Add hover effect
        option.addEventListener('mouseover', () => {
            option.style.backgroundColor = '#f0f0f0';
        });
        option.addEventListener('mouseout', () => {
            option.style.backgroundColor = 'white';
        });
        option.addEventListener('click', () => {
            selectedLanguage = language;
            options.style.display = 'none';
            document.getElementById(containerID).innerHTML = '';
            generateForm(containerID, bannerID);
        });

        options.appendChild(option);
    });

    container.appendChild(options);

    // Add click event to the icon to toggle options
    container.addEventListener('click', () => {
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    // Add click event to close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) {
            options.style.display = 'none';
        }
    });

    return container;
}

function renderFooterLinks(containerId, links) {
    const container = document.getElementById(containerId);
    const footerContainer = document.createElement('footer');
    if (!container) {
        console.error("Container not found.");
        return;
    }

    // Create an <hr> element to separate content above
    const hr = document.createElement("hr");
    hr.style.color = links[0].textColor;
    hr.style.margin = "8px";
    container.appendChild(hr);

    footerContainer.style.display = "flex";
    // Loop through the links array and create anchor tags
    links.forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.innerHTML = link.label;
        a.style.color = link.textColor;  // Apply text color
        a.style.marginLeft = "10px"

        // Append the link to the container
        footerContainer.appendChild(a);
        footerContainer.appendChild(document.createElement("br")); // Add line break after each link
    });
    container.appendChild(footerContainer);
}

// Function to generate the form & consent.
async function generateForm(containerID, bannerID) {
    try {
        // Check if container exists
        const formContainer = document.getElementById(containerID);
        if (!formContainer) {
            console.error('Container not found:', containerID);
            displayComponentError(containerID, 'Failed to load the component: Container not found');
            return;
        }

        // Show loading while fetching and rendering
        showLoadingSpinner(containerID);

        globalConfig = globalConfig ? globalConfig : await fetchFormConfig(bannerID);
        // globalConfig = fetchDummyData();

        // Validate globalConfig
        if (!globalConfig) {
            throw new Error('Failed to fetch form configuration');
        }

        var config = (globalConfig[selectedLanguage] ? globalConfig[selectedLanguage] : globalConfig).formData.look_and_feel.use_template_create_new.result;

        // Validate config
        if (!config) {
            throw new Error('Invalid form configuration');
        }
        injectCSS(containerID, config);
        formContainer.style.backgroundColor = config.uiSettings.background;

        const headerContainer = document.createElement('div');
        headerContainer.style.display = "flex";
        headerContainer.style.justifyContent = "space-between";
        headerContainer.style.alignItems = "flex-start";
        // Add logo
        if (config.uiSettings.logo) {
            const logo = document.createElement('img');
            logo.src = config.uiSettings.logo;
            logo.alt = "Logo";
            logo.className = 'logo';
            headerContainer.appendChild(logo);
        } else {
            headerContainer.style.justifyContent = "flex-end";
        }

        // Call the function to create and display the element
        headerContainer.appendChild(createTranslationElement(globalConfig, containerID, bannerID));
        formContainer.appendChild(headerContainer);

        // Create and append title
        const title = document.createElement('h1');
        title.textContent = config.uiSettings.title;
        title.style.fontSize = '1.875rem';
        title.style.fontWeight = '700';
        title.style.marginBottom = '1.5rem';
        if (config.uiSettings.text) {
            title.style.color = config.uiSettings.text;
        }
        formContainer.appendChild(title);

        // Set shape and size
        if (config.uiSettings.shape === "rectangle") {
            formContainer.style.borderRadius = "8px";
        } else if (config.uiSettings.shape === "square") {
            formContainer.style.borderRadius = "0";
        }

        //Set Banner container
        if (config.uiSettings.size === "small") {
            formContainer.style.padding = "24px";
            formContainer.style.width = "384px";
        } else if (config.uiSettings.size === "medium") {
            formContainer.style.padding = "24px";
            formContainer.style.width = "450px";
        } else if (config.uiSettings.size === "large") {
            formContainer.style.padding = "30px";
            formContainer.style.width = "600px";
        } else if (config.uiSettings.size === "custom" && config.uiSettings.customSize) {
            formContainer.style.width = config.uiSettings.customSize.width;
            formContainer.style.height = config.uiSettings.customSize.height;
            formContainer.style.padding = "20px"; // Default padding for custom size
        }


        const extractVendorLabelsFromConsent = (consentVendorArray) => {
            const labels = [];

            if (!consentVendorArray || !Array.isArray(consentVendorArray)) {
                return labels;
            }

            consentVendorArray.forEach(vendor => {
                if (typeof vendor === 'string') {
                    labels.push(vendor);
                } else if (typeof vendor === 'object' && vendor !== null) {
                    // Extract label property from vendor object
                    const label = vendor.label || vendor.name || vendor.title || '';
                    if (label) {
                        labels.push(label);
                    }
                }
            });

            return labels;
        };

        const findVendorsForCheckbox = (checkboxLabelText, vendorList) => {
            if (!vendorList || !Array.isArray(vendorList)) {
                return [];
            }

            // Trim the checkbox label text for comparison
            const trimmedCheckboxLabel = checkboxLabelText.trim();

            // Find the consent that matches this checkbox label
            const matchingConsent = vendorList.find(consent => {
                // Match by consent_name (primary match) - trim for comparison
                const consentName = (consent.consent_name || '').trim();

                // Also check description array if consent_name doesn't match
                const description = Array.isArray(consent.description)
                    ? (consent.description[0] || '').trim()
                    : (consent.description || '').trim();
                const descriptionArray = Array.isArray(consent.description)
                    ? consent.description.map(d => String(d || '').trim())
                    : [];

                // Check if checkbox label matches consent_name or description (case-insensitive, trimmed)
                return trimmedCheckboxLabel.toLowerCase() === consentName.toLowerCase() ||
                    trimmedCheckboxLabel.toLowerCase() === description.toLowerCase() ||
                    descriptionArray.some(d => trimmedCheckboxLabel.toLowerCase() === d.toLowerCase());
            });

            // Extract vendors from matching consent
            if (matchingConsent && matchingConsent.vendor && Array.isArray(matchingConsent.vendor)) {
                return extractVendorLabelsFromConsent(matchingConsent.vendor);
            }

            return [];
        };

        const addVendorInfoToCheckboxes = (vendorList, containerID) => {
            if (!vendorList || (Array.isArray(vendorList) && vendorList.length === 0)) {
                return;
            }

            const escapeHtml = (str) => {
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            // Find all checkbox labels in the container
            const container = document.getElementById(containerID);
            if (!container) return;

            const checkboxInputs = container.querySelectorAll('input[type="checkbox"][data-label]');
            checkboxInputs.forEach(inputEl => {
                const inputId = inputEl.getAttribute('id');
                if (!inputId) return;

                const label = container.querySelector(`label[for="${inputId}"]`);
                if (!label) return;

                // Check if vendor info already added (wrapper is a sibling of label)
                const labelHost = label.closest('.form-check') || label.parentElement;
                if (labelHost && labelHost.querySelector('.vendor-info-icon')) {
                    return;
                }

                // Get checkbox label text to match with consent
                // Remove "Vendors" text if it was already added
                let checkboxLabelText = label.textContent.trim();
                checkboxLabelText = checkboxLabelText.replace(/\s*Vendors\s*$/, '').trim();

                // Find vendors for this specific checkbox based on consent_name
                const vendorLabels = findVendorsForCheckbox(checkboxLabelText, vendorList);

                // Only add vendor info if there are vendors for this checkbox
                if (vendorLabels.length === 0) {
                    return;
                }

                // Create vendor info icon wrapper
                const vendorInfoWrapper = document.createElement("div");
                vendorInfoWrapper.className = "vendor-info-wrapper";
                vendorInfoWrapper.style.display = "inline-flex";
                vendorInfoWrapper.style.alignItems = "center";
                vendorInfoWrapper.style.marginLeft = "0.5rem";
                vendorInfoWrapper.style.position = "relative";

                // Create icon
                const infoIconDiv = document.createElement("div");
                infoIconDiv.className = "infoIconDiv vendor-info-icon";
                infoIconDiv.style.cursor = "pointer";
                infoIconDiv.style.display = "inline-flex";
                infoIconDiv.style.alignItems = "center";
                infoIconDiv.style.gap = "0.25rem";
                const svgIcon = document.createElement('div');
                svgIcon.innerHTML = '<svg fill="#000000" width="1rem" height="1rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="M20.52,3.87A5,5,0,0,0,11.44,4H7A3,3,0,0,0,4,7v4a1,1,0,0,0,2,0V7A1,1,0,0,1,7,6H9.78A3,3,0,0,0,9,8a3,3,0,0,0,3,3h7.33a3.66,3.66,0,0,0,1.19-7.13ZM19.33,9H12a1,1,0,0,1,0-2,1,1,0,0,0,1-1,3,3,0,0,1,5.84-1,1,1,0,0,0,.78.67A1.65,1.65,0,0,1,21,7.33,1.67,1.67,0,0,1,19.33,9ZM19,13a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H14.74a3.66,3.66,0,0,0-2.22-2.13,5,5,0,0,0-9.45,1.28A3,3,0,0,0,4,23h7.33a3.66,3.66,0,0,0,3.6-3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13Zm-7.67,8H4a1,1,0,0,1,0-2,1,1,0,0,0,1-1,3,3,0,0,1,5.84-1,1,1,0,0,0,.78.67A1.65,1.65,0,0,1,13,19.33,1.67,1.67,0,0,1,11.33,21Z"/></svg>';
                infoIconDiv.appendChild(svgIcon);

                // Add "Vendors" text next to the icon
                const vendorsText = document.createElement("span");
                vendorsText.textContent = "Vendors";
                vendorsText.style.fontSize = "0.75rem";
                vendorsText.style.marginLeft = "0.25rem";
                infoIconDiv.appendChild(vendorsText);

                // Pure HTML/CSS tooltip
                const tooltip = document.createElement("div");
                tooltip.className = "dcb-vendor-tooltip";
                tooltip.style.position = "absolute";
                tooltip.style.left = "100%";
                tooltip.style.top = "50%";
                tooltip.style.transform = "translateY(-50%)";
                tooltip.style.marginLeft = "8px";
                tooltip.style.backgroundColor = "rgb(31, 41, 55)";
                tooltip.style.color = "rgb(255, 255, 255)";
                tooltip.style.padding = "0.5rem 0.75rem";
                tooltip.style.borderRadius = "0.375rem";
                tooltip.style.boxShadow = "rgba(0, 0, 0, 0.1) 0px 4px 6px";
                tooltip.style.minWidth = "150px";
                tooltip.style.maxWidth = "250px";
                tooltip.style.zIndex = "1000";
                tooltip.style.opacity = "0";
                tooltip.style.visibility = "hidden";
                tooltip.style.pointerEvents = "none";
                tooltip.style.transition = "opacity 0.2s ease, visibility 0.2s ease";

                const tooltipList = document.createElement("ul");
                tooltipList.style.margin = "0";
                tooltipList.style.padding = "0";
                tooltipList.style.listStyle = "none";
                vendorLabels.forEach(vendorLabel => {
                    const listItem = document.createElement("li");
                    listItem.textContent = vendorLabel;
                    listItem.style.color = "rgb(255, 255, 255)";
                    listItem.style.fontSize = "0.875rem";
                    listItem.style.marginBottom = "0.25rem";
                    listItem.style.listStyleType = "none";
                    if (vendorLabels.indexOf(vendorLabel) < vendorLabels.length - 1) {
                        listItem.style.marginBottom = "0.25rem";
                    }
                    tooltipList.appendChild(listItem);
                });
                tooltip.appendChild(tooltipList);

                vendorInfoWrapper.appendChild(infoIconDiv);
                vendorInfoWrapper.appendChild(tooltip);

                // Show tooltip on hover
                infoIconDiv.addEventListener('mouseenter', function () {
                    tooltip.style.opacity = "1";
                    tooltip.style.visibility = "visible";
                });

                vendorInfoWrapper.addEventListener('mouseleave', function () {
                    tooltip.style.opacity = "0";
                    tooltip.style.visibility = "hidden";
                });

                // Append as sibling after checkbox label (matches required DOM structure)
                label.insertAdjacentElement('afterend', vendorInfoWrapper);
            });
        };


        //Methd to append field in the form as per the banner configuration    
        const appendFields = (config, fields, bannerID, is_buttons) => {
            let formControl = '';
            let buttonGroup = '';
            if (is_buttons) {
                formControl = document.createElement('div');
                formControl.setAttribute('data-dcb-field', 'true');
                buttonGroup = document.createElement('div');
                buttonGroup.className = 'button-group';
            }
            fields.forEach(field => {
                if (!is_buttons) {
                    formControl = document.createElement('div');
                    formControl.setAttribute('data-dcb-field', 'true');
                    formControl.classList.add('mb-3');
                }

                if (field.type === 'button') {
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.justifyContent = 'space-between';
                    buttonContainer.style.alignItems = 'center';

                    const button = document.createElement('button');
                    button.className = 'button dcb-submit-button';
                    button.textContent = field.label;

                    // Get button color from field.color, or from submissionConfig.actions[0].bgColor, or default
                    let buttonColor = field.color;
                    if (!buttonColor || buttonColor.trim() === '') {
                        const currentConfig = (globalConfig[selectedLanguage] ? globalConfig[selectedLanguage] : globalConfig);
                        if (currentConfig?.formData?.look_and_feel?.use_template_create_new?.final?.submissionConfig?.actions?.[0]?.bgColor) {
                            buttonColor = currentConfig.formData.look_and_feel.use_template_create_new.final.submissionConfig.actions[0].bgColor;
                        } else {
                            buttonColor = '#007BFF';
                        }
                    }
                    button.style.backgroundColor = buttonColor;
                    button.style.flex = '1';
                    button.style.position = 'relative';
                    button.style.overflow = 'hidden';
                    button.setAttribute('data-action', field.action);
                    var endpoint_url = API_BASE_URL + API_POST_PAYLOAD;

                    // Add click animation effect
                    button.addEventListener('click', function (e) {
                        const ripple = document.createElement('span');
                        ripple.className = 'dcb-button-ripple';
                        const rect = button.getBoundingClientRect();
                        const size = Math.max(rect.width, rect.height);
                        const x = e.clientX - rect.left - size / 2;
                        const y = e.clientY - rect.top - size / 2;

                        ripple.style.width = ripple.style.height = size + 'px';
                        ripple.style.left = x + 'px';
                        ripple.style.top = y + 'px';
                        button.appendChild(ripple);

                        setTimeout(() => {
                            if (ripple.parentElement) {
                                ripple.remove();
                            }
                        }, 600);

                        handleButtonClick(config, field.action, endpoint_url, bannerID, containerID);
                    });

                    if (field.size === 'small') {
                        button.style.padding = '5px 10px';
                        button.style.fontSize = '12px';
                    } else if (field.size === 'medium') {
                        button.style.padding = '10px 15px';
                        button.style.fontSize = '14px';
                    } else if (field.size === 'large') {
                        button.style.width = '100%';
                        button.style.height = '50px';
                        button.style.fontSize = '16px';
                    } else if (field.size === 'custom' && field.customSize) {
                        button.style.width = field.customSize.width;
                        button.style.height = field.customSize.height;
                    }
                    buttonContainer.appendChild(button);
                    buttonGroup.appendChild(buttonContainer);
                } else {
                    if (field.type === 'checkbox') {
                        const checkboxContainer = document.createElement('div');
                        checkboxContainer.className = 'form-check';

                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        input.className = 'form-check-input';
                        input.checked = !!field.value;
                        input.setAttribute('data-required', field.validation?.required);
                        input.setAttribute('data-label', field.label);
                        if (field.id) input.setAttribute('data-id', field.id);


                        const checkboxId =
                            (field.id && String(field.id).trim() !== '')
                                ? `dcb-checkbox-${field.id}`
                                : `dcb-checkbox-${containerID}-${Math.random().toString(36).slice(2, 10)}`;
                        input.id = checkboxId;

                        const label = document.createElement('label');
                        label.className = 'form-check-label small';
                        label.setAttribute('for', checkboxId);
                        label.style.cursor = 'pointer';
                        // Keep label inline so vendor element can sit at end and wrap naturally
                        label.style.display = 'inline';
                        label.style.whiteSpace = 'normal';
                        label.style.wordBreak = 'break-word';
                        label.style.fontWeight = '500';
                        if (config.uiSettings.text) {
                            label.style.color = config.uiSettings.text;
                        }
                        label.appendChild(document.createTextNode(field.label));

                        checkboxContainer.appendChild(input);
                        checkboxContainer.appendChild(label);
                        formControl.appendChild(checkboxContainer);
                    } else {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        label.style.fontSize = '0.875rem';
                        label.style.fontWeight = '500';
                        label.style.marginBottom = '0.5rem';
                        if (config.uiSettings.text) {
                            label.style.color = config.uiSettings.text;
                        }

                        if (field.validation?.required) {
                            const mandatoryIndicator = document.createElement('span');
                            mandatoryIndicator.className = 'mandatory';
                            mandatoryIndicator.textContent = '*';
                            label.appendChild(mandatoryIndicator);
                        }

                        label.appendChild(document.createTextNode(` ${field.label}`));
                        formControl.appendChild(label);

                        let input;
                        if (field.type === 'select') {
                            input = document.createElement('select');
                            input.classList.add('form-control');
                            field.options.forEach(option => {
                                const opt = document.createElement('option');
                                opt.value = option.value;
                                opt.textContent = option.label;
                                input.appendChild(opt);
                            });
                            input.setAttribute('data-required', field.validation?.required);
                            input.setAttribute('data-label', field.label);
                            formControl.appendChild(input);
                        } else if (field.type === 'radio') {
                            const radioGroup = document.createElement('div');
                            radioGroup.className = 'radio-group';
                            radioGroup.setAttribute('data-required', field.validation?.required);
                            radioGroup.setAttribute('data-label', field.label);

                            field.options.forEach(option => {
                                const radioContainer = document.createElement('div');

                                const radioInput = document.createElement('input');
                                radioInput.type = 'radio';
                                radioInput.name = field.label;
                                radioInput.value = option.value;
                                // radioInput.setAttribute('data-required', field.validation?.required);
                                // radioInput.setAttribute('data-label', field.label);

                                const radioLabel = document.createElement('label');
                                radioLabel.textContent = option.label;
                                radioLabel.style.display = 'block';
                                radioLabel.style.fontSize = '0.875rem';
                                radioLabel.style.fontWeight = '500';
                                radioLabel.style.marginLeft = '5px';
                                radioLabel.style.marginBottom = '0.5rem';
                                if (config.uiSettings.text) {
                                    radioLabel.style.color = config.uiSettings.text;
                                }

                                radioContainer.appendChild(radioInput);
                                radioContainer.appendChild(radioLabel);
                                radioGroup.appendChild(radioContainer);
                            });
                            formControl.appendChild(radioGroup);
                        } else if (field.type === 'checkboxGroup') {
                            const checkboxGroup = document.createElement('div');
                            checkboxGroup.className = 'checkbox-group';
                            checkboxGroup.setAttribute('data-required', field.validation?.required);
                            checkboxGroup.setAttribute('data-label', field.label);
                            if (field.id)
                                checkboxGroup.setAttribute('data-id', field.id);
                            field.options.forEach(option => {
                                const checkboxContainer = document.createElement('div');
                                checkboxContainer.className = 'form-check';

                                const checkboxInput = document.createElement('input');
                                checkboxInput.type = 'checkbox';
                                checkboxInput.className = 'form-check-input';
                                checkboxInput.name = field.label + "[]";
                                checkboxInput.value = option.value;
                                const groupSlug = String(field.label || 'group')
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/(^-|-$)/g, '');
                                const optionSlug = String(option.value ?? option.label ?? 'option')
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/(^-|-$)/g, '');
                                checkboxInput.id = `dcb-checkbox-group-${containerID}-${groupSlug}-${optionSlug}`;

                                // checkboxInput.setAttribute('data-required', field.validation?.required);
                                // checkboxInput.setAttribute('data-label', field.label);

                                const checkboxLabel = document.createElement('label');
                                checkboxLabel.className = 'form-check-label fw-normal';
                                checkboxLabel.setAttribute('for', checkboxInput.id);
                                checkboxLabel.style.cursor = 'pointer';
                                // Keep label inline so any trailing inline elements can wrap naturally
                                checkboxLabel.style.display = 'inline';
                                checkboxLabel.style.whiteSpace = 'normal';
                                checkboxLabel.style.wordBreak = 'break-word';
                                if (config.uiSettings.text) {
                                    checkboxLabel.style.color = config.uiSettings.text;
                                }
                                checkboxLabel.appendChild(document.createTextNode(option.label));

                                checkboxContainer.appendChild(checkboxInput);
                                checkboxContainer.appendChild(checkboxLabel);
                                checkboxGroup.appendChild(checkboxContainer);
                            });
                            formControl.appendChild(checkboxGroup);
                        } else {
                            const normalizedType = String(field.type || '').toLowerCase();
                            if (normalizedType === 'textarea' || normalizedType === 'textrea') {
                                input = document.createElement('textarea');
                                input.classList.add('form-control');
                                input.value = field.value || '';
                                input.placeholder = field.placeholder || '';
                            } else {
                                input = document.createElement('input');
                                input.classList.add('form-control');
                                // Map custom config types to valid HTML input types
                                input.type = {
                                    phone: 'tel',
                                    pancard: 'text',
                                    aadhaar: 'text'
                                }[normalizedType] || field.type || 'text';
                                input.value = field.value || '';
                                input.placeholder = field.placeholder || '';
                            }
                            input.setAttribute('data-required', field.validation?.required);
                            input.setAttribute('data-label', field.label);

                            // Store validation rules as data attributes
                            if (field.validation) {
                                if (field.validation.minLength) {
                                    input.setAttribute('data-min-length', field.validation.minLength.value || field.validation.minLength);
                                    input.setAttribute('data-min-length-msg', field.validation.minLength.message || `Minimum ${field.validation.minLength.value || field.validation.minLength} characters required`);
                                }
                                if (field.validation.maxLength) {
                                    input.setAttribute('data-max-length', field.validation.maxLength.value || field.validation.maxLength);
                                    input.setAttribute('data-max-length-msg', field.validation.maxLength.message || `Maximum ${field.validation.maxLength.value || field.validation.maxLength} characters allowed`);
                                }
                                if (field.validation.pattern) {
                                    input.setAttribute('data-pattern', field.validation.pattern.value || field.validation.pattern);
                                    input.setAttribute('data-pattern-msg', field.validation.pattern.message || 'Invalid format');
                                }
                                // Email validation
                                if (field.type === 'email') {
                                    input.setAttribute('data-email', 'true');
                                    input.setAttribute('data-email-msg', field.validation.email?.message || 'Please enter a valid email address');
                                }
                                // Phone number validation
                                if (field.type === 'phone' || (field.type === 'text' && (field.name?.toLowerCase().includes('phone') || field.name?.toLowerCase().includes('mobile') || field.label?.toLowerCase().includes('phone') || field.label?.toLowerCase().includes('mobile')))) {
                                    input.setAttribute('data-phone', 'true');
                                    input.setAttribute('data-phone-msg', field.validation.phone?.message || 'Please enter a valid phone number');
                                }
                            }

                            const isPanCardField = field.type === 'pancard' || (field.type === 'text' && field.name?.toLowerCase().includes('pan'));
                            if (isPanCardField) {
                                input.setAttribute('maxlength', '10');
                                input.setAttribute('data-pancard', 'true');
                                input.setAttribute('data-pancard-msg', field.validation?.pancard?.message || 'Please enter a valid PAN card number');
                                input.setAttribute('data-min-length', field.validation?.minLength?.value || 10);
                                input.setAttribute('data-min-length-msg', field.validation?.minLength?.message || `Minimum ${field.validation?.minLength?.value || 10} characters required`);
                                input.setAttribute('data-max-length', field.validation?.maxLength?.value || 10);
                                input.setAttribute('data-max-length-msg', field.validation?.maxLength?.message || `Maximum ${field.validation?.maxLength?.value || 10} characters allowed`);
                            }

                            const isAadhaarField = field.type === 'aadhaar' || (field.type === 'text' && field.name?.toLowerCase().includes('aadhaar'));
                            if (isAadhaarField) {
                                input.setAttribute('maxlength', '14'); // 12 digits + 2 spaces for formatting
                                input.setAttribute('data-aadhaar', 'true');
                                input.setAttribute('data-aadhaar-msg', field.validation?.aadhaar?.message || 'Please enter a valid Aadhaar number');
                                input.setAttribute('data-min-length', field.validation?.minLength?.value || 12);
                                input.setAttribute('data-min-length-msg', field.validation?.minLength?.message || `Minimum ${field.validation?.minLength?.value || 14} characters required`);
                                input.setAttribute('data-max-length', field.validation?.maxLength?.value || 14);
                                input.setAttribute('data-max-length-msg', field.validation?.maxLength?.message || `Maximum ${field.validation?.maxLength?.value || 14} characters allowed`);
                            }

                            // Name field validation - only letters and spaces allowed
                            const isNameField = field.type === 'text' && (
                                field.name?.toLowerCase() === 'name' ||
                                field.crmFieldName?.toLowerCase() === 'name' ||
                                field.label?.toLowerCase() === 'name' ||
                                field.label?.toLowerCase().includes('full name') ||
                                field.label?.toLowerCase().includes('first name') ||
                                field.label?.toLowerCase().includes('last name')
                            );

                            if (isNameField) {
                                input.setAttribute('data-name', 'true');
                                input.setAttribute('data-name-msg', field.validation?.name?.message || 'Name can only contain letters and spaces');
                                // Prevent typing numbers and special characters in name fields
                                input.addEventListener('keypress', function (e) {
                                    const char = String.fromCharCode(e.which);
                                    if (!/[a-zA-Z\s]/.test(char)) {
                                        e.preventDefault();
                                    }
                                });
                                // Also prevent pasting invalid characters
                                input.addEventListener('paste', function (e) {
                                    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                                    if (!/^[a-zA-Z\s]*$/.test(pastedText)) {
                                        e.preventDefault();
                                        // Show error message
                                        const parent = input.parentElement;
                                        const existingError = parent.querySelector('.error');
                                        if (!existingError) {
                                            const errorMsg = document.createElement('div');
                                            errorMsg.className = 'error';
                                            errorMsg.textContent = input.getAttribute('data-name-msg');
                                            parent.appendChild(errorMsg);

                                            // Auto-remove error message after 5 seconds with fade animation
                                            setTimeout(() => {
                                                fadeOutError(errorMsg);
                                            }, 5000);
                                        }
                                    }
                                });
                            }

                            // Phone number field - only numbers allowed
                            const isPhoneField = field.type === 'phone' || field.type === 'number' ||
                                (field.type === 'text' && (
                                    field.name?.toLowerCase().includes('phone') ||
                                    field.name?.toLowerCase().includes('mobile') ||
                                    field.crmFieldName?.toLowerCase().includes('phone') ||
                                    field.crmFieldName?.toLowerCase().includes('mobile') ||
                                    field.label?.toLowerCase().includes('phone') ||
                                    field.label?.toLowerCase().includes('mobile')
                                ));

                            if (isPhoneField) {
                                input.setAttribute('data-phone-only', 'true');
                                input.setAttribute('data-phone-only-msg', field.validation?.phone?.message || 'Please enter a valid mobile number');
                                // Indian mobile number regex pattern
                                const mobileRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
                                input.setAttribute('data-phone-regex', mobileRegex.toString());
                                input.addEventListener('keypress', function (e) {
                                    const char = String.fromCharCode(e.which);
                                    const currentValue = input.value;

                                    if (/[\+0-9\s\-]/.test(char)) {
                                        return true;
                                    }

                                    e.preventDefault();
                                });

                                input.addEventListener('paste', function (e) {
                                    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                                    if (!mobileRegex.test(pastedText)) {
                                        e.preventDefault();
                                        const parent = input.parentElement;
                                        const existingError = parent.querySelector('.error');
                                        if (!existingError) {
                                            const errorMsg = document.createElement('div');
                                            errorMsg.className = 'error';
                                            errorMsg.textContent = input.getAttribute('data-phone-only-msg');
                                            parent.appendChild(errorMsg);
                                            setTimeout(() => {
                                                fadeOutError(errorMsg);
                                            }, 5000);
                                        }
                                    }
                                });
                            }

                            // Add real-time validation on blur
                            input.addEventListener('blur', function () {
                                validateField(input);
                            });

                            // Clear error on input
                            input.addEventListener('input', function () {
                                // Get the correct parent (handle OTP-wrapped fields)
                                let parent = input.parentElement;
                                if (parent.classList && parent.classList.contains('otp-input-wrapper')) {
                                    parent = parent.parentElement;
                                }
                                // Remove ALL existing error messages
                                const errorContainers = parent.querySelectorAll('.error');
                                errorContainers.forEach(error => error.remove());
                            });

                            // Handle OTP functionality (inputs only; textarea should never be OTP-wrapped)
                            if (field.validate === true && input.tagName === 'INPUT') {
                                input.setAttribute('data-validate', 'true');
                                input.setAttribute('data-otp-verified', 'false');

                                // Create wrapper for input with OTP functionality
                                const inputWrapper = document.createElement('div');
                                inputWrapper.className = 'otp-input-wrapper';
                                inputWrapper.style.position = 'relative';

                                // Add padding-right to input to make room for verify label
                                input.style.paddingRight = '70px';

                                // Create verify label inside the input field
                                const verifyLabel = document.createElement('label');
                                verifyLabel.textContent = 'Verify';
                                verifyLabel.className = 'otp-verify-label';
                                verifyLabel.style.position = 'absolute';
                                verifyLabel.style.right = '10px';
                                verifyLabel.style.top = '50%';
                                verifyLabel.style.transform = 'translateY(-50%)';
                                verifyLabel.style.cursor = 'pointer';
                                verifyLabel.style.color = '#007BFF';
                                verifyLabel.style.fontSize = '14px';
                                verifyLabel.style.fontWeight = '500';
                                verifyLabel.style.userSelect = 'none';
                                verifyLabel.style.pointerEvents = 'auto';
                                verifyLabel.style.zIndex = '10';
                                verifyLabel.style.backgroundColor = 'transparent';

                                // Prevent input focus when clicking verify label
                                verifyLabel.addEventListener('mousedown', function (e) {
                                    e.preventDefault();
                                });

                                // Create OTP container (initially hidden)
                                const otpContainer = document.createElement('div');
                                otpContainer.className = 'otp-container';
                                otpContainer.style.display = 'none';
                                otpContainer.style.marginTop = '10px';
                                otpContainer.style.padding = '10px';
                                const otpInputButtonWrapper = document.createElement('div');
                                otpInputButtonWrapper.style.display = 'flex';
                                otpInputButtonWrapper.style.gap = '10px';
                                otpInputButtonWrapper.style.alignItems = 'center';

                                // Create OTP input field
                                const otpInput = document.createElement('input');
                                otpInput.type = 'text';
                                otpInput.placeholder = 'Enter OTP';
                                otpInput.className = 'otp-input';
                                otpInput.style.flex = '1';
                                otpInput.style.padding = '8px';

                                otpInput.style.border = '1px solid #929ba5';
                                otpInput.style.borderRadius = '8px';
                                otpInput.style.boxSizing = 'border-box';
                                otpInput.setAttribute('maxlength', '6');

                                // Create verify button
                                const verifyButton = document.createElement('button');
                                verifyButton.textContent = 'Verify OTP';
                                verifyButton.type = 'button';
                                verifyButton.className =
                                    'otp-verify-button btn btn-light btn-sm';

                                verifyButton.style.cursor = 'pointer';
                                verifyButton.style.fontSize = '14px';
                                verifyButton.style.width = 'auto';
                                verifyButton.style.whiteSpace = 'nowrap';
                                verifyButton.style.flexShrink = '0';
                                verifyButton.style.minWidth = '100px';

                                // Create resend OTP button
                                const resendButton = document.createElement('button');
                                resendButton.textContent = 'Resend OTP';
                                resendButton.type = 'button';
                                resendButton.className =
                                    'otp-resend-button btn btn-link btn-sm';
                                resendButton.style.display = 'none';
                                resendButton.style.padding = '8px 16px';
                                resendButton.style.fontSize = '14px';
                                resendButton.style.cursor = 'pointer';
                                resendButton.style.border = 'none';
                                resendButton.style.background = 'transparent';
                                resendButton.style.whiteSpace = 'nowrap';
                                resendButton.style.flexShrink = '0';
                                resendButton.style.width = 'auto';

                                // Variable to store resend countdown timer
                                let resendCountdownTimer = null;
                                let resendCountdownSeconds = 0;
                                let otpSendFailed = false;

                                // Create success tick icon (initially hidden)
                                const successTick = document.createElement('span');
                                successTick.className = 'otp-success-tick';
                                successTick.innerHTML = '✓';
                                successTick.style.display = 'none';
                                successTick.style.position = 'absolute';
                                successTick.style.right = '10px';
                                successTick.style.top = '50%';
                                successTick.style.transform = 'translateY(-50%)';
                                successTick.style.color = '#28a745';
                                successTick.style.fontSize = '20px';
                                successTick.style.fontWeight = 'bold';
                                successTick.style.zIndex = '10';

                                // Append elements
                                inputWrapper.appendChild(input);
                                inputWrapper.appendChild(verifyLabel);
                                inputWrapper.appendChild(successTick);
                                otpInputButtonWrapper.appendChild(otpInput);
                                otpInputButtonWrapper.appendChild(verifyButton);
                                otpInputButtonWrapper.appendChild(resendButton);
                                otpContainer.appendChild(otpInputButtonWrapper);
                                inputWrapper.appendChild(otpContainer);

                                // Function to send OTP via API
                                async function sendOTP() {
                                    const fieldValue = input.value.trim();
                                    const fieldType = field.type === 'email' ? 'email' : 'phone';

                                    const payload = {};
                                    if (fieldType === 'email') {
                                        payload.email = fieldValue;
                                        payload.fieldType = fieldType;
                                    } else {
                                        payload.phone_number = btoa('+91' + fieldValue); // Base64 encode with country code
                                        payload.dcb_id = bannerID;
                                    }

                                    try {
                                        const response = await fetch(fieldType === 'email' ? '/send_otp' : `${API_BASE_URL}dcb_send_otp`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(payload)
                                        });

                                        const data = await response.json();

                                        if (!response.ok) {
                                            throw new Error(data.message || 'Failed to send OTP');
                                        }

                                        return data;
                                    } catch (error) {
                                        console.error('Error sending OTP:', error);
                                        throw error;
                                    }
                                }

                                // Function to stop resend countdown
                                function stopResendCountdown() {
                                    if (resendCountdownTimer) {
                                        clearInterval(resendCountdownTimer);
                                        resendCountdownTimer = null;
                                    }
                                    resendButton.style.display = 'none';
                                    resendCountdownSeconds = 0;
                                }

                                // Function to start resend countdown
                                function startResendCountdown(expiresInSeconds) {
                                    // Clear any existing timer
                                    if (resendCountdownTimer) {
                                        clearInterval(resendCountdownTimer);
                                    }

                                    resendCountdownSeconds = expiresInSeconds || 60; // Default to 60 seconds if not provided
                                    resendButton.style.display = 'block';
                                    resendButton.disabled = true;
                                    resendButton.style.opacity = '0.6';
                                    resendButton.style.cursor = 'not-allowed';
                                    resendButton.textContent = `Resend OTP (${resendCountdownSeconds}s)`;

                                    // Start countdown
                                    resendCountdownTimer = setInterval(() => {
                                        resendCountdownSeconds--;

                                        if (resendCountdownSeconds > 0) {
                                            // Update countdown text
                                            resendButton.textContent = `Resend OTP (${resendCountdownSeconds}s)`;
                                        } else {
                                            // Countdown finished - enable resend button
                                            clearInterval(resendCountdownTimer);
                                            resendCountdownTimer = null;

                                            // Only enable if OTP is not verified
                                            if (input.getAttribute('data-otp-verified') !== 'true') {
                                                resendButton.disabled = false;
                                                resendButton.style.opacity = '1';
                                                resendButton.style.cursor = 'pointer';
                                                resendButton.textContent = 'Resend OTP';
                                            }
                                        }
                                    }, 1000);
                                }

                                // Function to reset button to verify state
                                function resetVerifyButton() {
                                    stopResendCountdown();
                                    verifyButton.disabled = false;
                                    verifyButton.textContent = 'Verify OTP';
                                    verifyButton.style.opacity = '1';
                                    verifyButton.style.cursor = 'pointer';
                                    otpSendFailed = false;
                                }

                                // Handle verify label click
                                verifyLabel.addEventListener('click', function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    // Clear any existing errors first
                                    let formControl = inputWrapper.parentElement;
                                    const existingErrors = formControl.querySelectorAll('.error');
                                    existingErrors.forEach(err => err.remove());

                                    // Validate the main field first
                                    if (!validateField(input)) {
                                        return;
                                    }

                                    // Clear OTP container errors
                                    const otpErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                    otpErrors.forEach(err => err.remove());

                                    // Disable input field during OTP verification
                                    input.disabled = true;
                                    input.style.opacity = '0.6';

                                    // Send OTP
                                    sendOTP().then((data) => {
                                        
                                        otpSendFailed = false;

                                        // Show OTP container
                                        otpContainer.style.display = 'block';
                                        verifyLabel.style.display = 'none';

                                        // Reset button to verify state
                                        resetVerifyButton();

                                        // Start resend countdown (60 seconds)
                                        startResendCountdown(data.data?.expires_in || 60);

                                        // Focus on OTP input
                                        setTimeout(() => {
                                            otpInput.focus();
                                        }, 100);
                                    }).catch((error) => {
                                        otpSendFailed = true;

                                        // Show OTP container even if send failed
                                        otpContainer.style.display = 'block';
                                        verifyLabel.style.display = 'none';

                                        // Reset button to verify state
                                        resetVerifyButton();

                                        // Start resend countdown immediately (user can resend after 60s)
                                        startResendCountdown();

                                        // Handle error if OTP sending fails
                                        const errorMsg = document.createElement('div');
                                        errorMsg.className = 'error otp-error';
                                        errorMsg.textContent = error.message || 'Failed to send OTP. You can resend after 60 seconds.';
                                        errorMsg.style.marginTop = '5px';
                                        otpContainer.appendChild(errorMsg);

                                        setTimeout(() => {
                                            fadeOutError(errorMsg);
                                        }, 5000);

                                        // Focus on OTP input
                                        setTimeout(() => {
                                            otpInput.focus();
                                        }, 100);
                                    });
                                });

                                // Handle resend OTP button click
                                resendButton.addEventListener('click', function () {
                                    if (resendButton.disabled) {
                                        return; // Still in countdown
                                    }

                                    // Ensure input is disabled during resend
                                    input.disabled = true;
                                    input.style.opacity = '0.6';
                                    // input.style.cursor = 'not-allowed';

                                    // Disable button while sending
                                    resendButton.disabled = true;
                                    resendButton.textContent = 'Sending...';
                                    resendButton.style.opacity = '0.6';

                                    // Resend OTP
                                    sendOTP().then((data) => {
                                        otpSendFailed = false;

                                        // Clear OTP input
                                        otpInput.value = '';

                                        // Remove all existing error messages
                                        const allErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                        allErrors.forEach(err => err.remove());

                                        // Reset and restart countdown
                                        stopResendCountdown();
                                        startResendCountdown(data.data?.expires_in || 60);

                                        // Focus on OTP input
                                        otpInput.focus();
                                    }).catch((error) => {
                                        otpSendFailed = true;

                                        // Handle error if OTP sending fails
                                        const errorMsg = document.createElement('div');
                                        errorMsg.className = 'error otp-error';
                                        errorMsg.textContent = error.message || 'Failed to resend OTP. Please try again after 60 seconds.';
                                        errorMsg.style.marginTop = '5px';
                                        otpContainer.appendChild(errorMsg);

                                        setTimeout(() => {
                                            fadeOutError(errorMsg);
                                        }, 5000);

                                        // Restart countdown so user can try again
                                        stopResendCountdown();
                                        startResendCountdown();
                                    });
                                });

                                // Handle OTP verification
                                verifyButton.addEventListener('click', function () {
                                    // Verify OTP
                                    const otpValue = otpInput.value.trim();

                                    // Remove all existing error messages first
                                    const allErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                    allErrors.forEach(err => err.remove());

                                    if (!otpValue) {
                                        // Show error
                                        const errorMsg = document.createElement('div');
                                        errorMsg.className = 'error otp-error';
                                        errorMsg.textContent = 'Please enter OTP';
                                        errorMsg.style.marginTop = '5px';
                                        otpContainer.appendChild(errorMsg);

                                        // Auto-remove error message after 5 seconds with fade animation
                                        setTimeout(() => {
                                            fadeOutError(errorMsg);
                                        }, 5000);
                                        return;
                                    }

                                    // Validate OTP format first
                                    if (!/^\d{6}$/.test(otpValue)) {
                                        // Invalid format
                                        const errorMsg = document.createElement('div');
                                        errorMsg.className = 'error otp-error';
                                        errorMsg.textContent = 'Invalid OTP format. Please enter a 6-digit OTP';
                                        errorMsg.style.marginTop = '5px';
                                        otpContainer.appendChild(errorMsg);

                                        setTimeout(() => {
                                            fadeOutError(errorMsg);
                                        }, 5000);
                                        return;
                                    }

                                    // Verify OTP via API
                                    const fieldValue = input.value.trim();
                                    const fieldType = field.type === 'email' ? 'email' : 'phone';

                                    const verifyPayload = {
                                        otp: otpValue
                                    };
                                    if (fieldType === 'email') {
                                        verifyPayload.email = fieldValue;
                                    } else {
                                        verifyPayload.phone_number = btoa('+91' + fieldValue);
                                        verifyPayload.dcb_id = bannerID;
                                        verifyPayload.otp = btoa(otpValue); // Base64 encode OTP for transmission
                                    }

                                    fetch(fieldType === 'email' ? '/verify_otp' : `${API_BASE_URL}dcb_verify_otp`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(verifyPayload)
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            
                                            if (data.verified || data.status_code === "200" || data.data.status_code === "200") {
                                                // OTP is valid
                                                input.setAttribute('data-otp-verified', 'true');
                                                otpContainer.style.display = 'none';
                                                verifyLabel.style.display = 'none';
                                                successTick.style.display = 'block';
                                                input.style.paddingRight = '40px';

                                                // Re-enable input field (keep disabled since verified)
                                                input.disabled = true;
                                                input.style.opacity = '0.6';
                                                // input.style.cursor = 'not-allowed';

                                                // Stop countdown and hide resend button
                                                stopResendCountdown();

                                                // Reset button to verify state
                                                resetVerifyButton();

                                                // Remove any error messages
                                                const otpErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                                otpErrors.forEach(err => err.remove());
                                            } else {
                                                // Invalid OTP
                                                const errorMsg = document.createElement('div');
                                                errorMsg.className = 'error otp-error';
                                                errorMsg.textContent = data.message || 'Invalid OTP. Please try again.';
                                                if (data.remainingAttempts) {
                                                    errorMsg.textContent += ` (${data.remainingAttempts} attempts remaining)`;
                                                }
                                                errorMsg.style.marginTop = '5px';
                                                otpContainer.appendChild(errorMsg);

                                                setTimeout(() => {
                                                    fadeOutError(errorMsg);
                                                }, 5000);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error verifying OTP:', error);
                                            const errorMsg = document.createElement('div');
                                            errorMsg.className = 'error otp-error';
                                            errorMsg.textContent = 'Failed to verify OTP. Please try again.';
                                            errorMsg.style.marginTop = '5px';
                                            otpContainer.appendChild(errorMsg);

                                            setTimeout(() => {
                                                fadeOutError(errorMsg);
                                            }, 5000);
                                        });
                                });

                                // Clear errors when OTP input changes
                                otpInput.addEventListener('input', function () {
                                    const otpErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                    otpErrors.forEach(err => err.remove());
                                });

                                // Allow Enter key to verify OTP
                                otpInput.addEventListener('keypress', function (e) {
                                    if (e.key === 'Enter') {
                                        verifyButton.click();
                                    }
                                });

                                // Reset OTP verification if main field changes
                                input.addEventListener('input', function () {
                                    // Re-enable input field if it was disabled
                                    if (input.disabled) {
                                        input.disabled = false;
                                        input.style.opacity = '1';
                                        input.style.cursor = 'text';
                                    }

                                    if (input.getAttribute('data-otp-verified') === 'true') {
                                        input.setAttribute('data-otp-verified', 'false');
                                        successTick.style.display = 'none';
                                        verifyLabel.style.display = 'block';
                                        input.style.paddingRight = '70px';
                                        otpContainer.style.display = 'none';
                                        otpInput.value = '';

                                        // Stop countdown and reset button state
                                        stopResendCountdown();
                                        resetVerifyButton();

                                        // Clear all errors
                                        const otpErrors = otpContainer.querySelectorAll('.otp-error, .error');
                                        otpErrors.forEach(err => err.remove());
                                    }
                                });

                                formControl.appendChild(inputWrapper);
                            } else {
                                formControl.appendChild(input);
                            }
                        }
                    }
                }
                if (is_buttons) {
                    formControl.appendChild(buttonGroup);
                }
                formContainer.appendChild(formControl);
            });
        };

        appendFields(config, config.uiSettings.fields, bannerID, false);
        appendFields(config, config.consentSettings.consentFields, bannerID, false);

        // Add vendor info to checkboxes
        // Pass the vendor structure as-is to preserve consent_name mapping
        const vendorConfig = (globalConfig[selectedLanguage] ? globalConfig[selectedLanguage] : globalConfig.default || globalConfig).formData.consentSettings.configure_vendor.vendor;

        // Use setTimeout to ensure checkboxes are rendered before adding vendor info
        setTimeout(() => {
            addVendorInfoToCheckboxes(vendorConfig, containerID);
        }, 0);

        appendFields(config, config.uiSettings.buttons, bannerID, true);

        if (config.uiSettings.policy && config.uiSettings.policy.length > 0)
            renderFooterLinks(containerID, config.uiSettings.policy);
    } catch (error) {
        console.error('Error generating form:', error);
        const msg = error && error.message ? error.message : 'Failed to load the component';
        const statusCode = error && error.statusCode ? error.statusCode : undefined;
        displayComponentError(containerID, msg, statusCode);
        raiseMessage(msg, 'error', statusCode || '200', '');
    } finally {
        hideLoadingSpinner(containerID);
    }
}

function fetchDummyData() {
    const data = {
        "uiSettings": {
            "logo": "https://cdn.prod.website-files.com/646e363f9c29e4860c52c82e/665f4b9f47a7740de833d1c2_Final%20Data%20Safeguard%20Logo.svg",
            "title": "A Loan For All Your Needs",
            "backgroundColor": "#FFFFFF",
            "shape": "square",
            "size": "custom",
            "customSize": { "width": "800px", "height": "800px" },
            "fields": [
                { "type": "text", "label": "First Name", "crmFieldName": "first_name", "value": "", "placeholder": "Enter your first name", "validation": { "required": true } },
                { "type": "text", "label": "Last Name", "crmFieldName": "last_name", "value": "", "placeholder": "Enter your last name", "validation": { "required": false } },
                { "type": "email", "label": "Email", "crmFieldName": "email", "value": "", "placeholder": "Enter your email", "validation": { "required": true } },
                { "type": "text", "label": "Mobile Number", "crmFieldName": "mobile_number", "value": "", "placeholder": "Enter your mobile number", "validation": { "required": true } },
                { "type": "radio", "label": "Gender", "crmFieldName": "gender", "value": "", "options": ["Male", "Female", "Other"], "validation": { "required": true } },
                { "type": "radio", "label": "Senior Citizen", "crmFieldName": "senior_citizen", "value": "", "options": ["Yes", "No"], "validation": { "required": true } },
                { "type": "select", "label": "Country", "crmFieldName": "country", "value": "", "options": ["USA", "Canada", "UK"], "validation": { "required": false } }
            ],
            "buttons": [
                { "type": "button", "label": "Submit", "crmFieldName": "submit", "size": "large", "color": "#3979BD", "action": "submit", "url": "", "customSize": { "width": "100%", "height": "50px" } }
            ]
        },
        "consentSettings": {
            "consentId": "123",
            "consent": "Loan Consent",
            "consentFields": [
                { "type": "checkbox", "label": "I agree to the Terms and Conditions", "value": false, "id": "consentkey_123", "validation": { "required": true } },
                { "type": "checkbox", "label": "I authorize the bank representatives to call me", "value": false, "id": "consentkey_1234", "validation": { "required": false } }
            ]
        }
    };

    return data;
}

function displayComponentError(containerID, errorMessage, statusCode) {
    const formContainer = document.getElementById(containerID);
    if (!formContainer) {
        console.error('Container not found:', containerID);
        return;
    }

    formContainer.innerHTML = '';

    const card = document.createElement('div');
    card.style.maxWidth = '480px';
    card.style.margin = '20px auto';
    card.style.padding = '16px 20px';
    card.style.borderRadius = '8px';
    card.style.border = '1px solid #FBD5D5';
    card.style.backgroundColor = '#FFF5F5';
    card.style.display = 'flex';
    card.style.alignItems = 'flex-start';
    card.style.gap = '12px';

    // Icon
    const iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#F5194F" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM13 16H11V14H13V16ZM13 12H11V7H13V12Z"/></svg>';

    // Content
    const content = document.createElement('div');

    const title = document.createElement('div');
    title.textContent = 'Failed to load the component';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '4px';
    title.style.color = '#B91C1C';

    const message = document.createElement('div');
    message.textContent = errorMessage || 'No DCB found with the given ID.';
    message.style.fontSize = '14px';
    message.style.color = '#7F1D1D';

    content.appendChild(title);
    content.appendChild(message);

    if (statusCode) {
        const code = document.createElement('div');
        code.textContent = `Status code: ${statusCode}`;
        code.style.fontSize = '12px';
        code.style.color = '#9B1C1C';
        code.style.marginTop = '6px';
        content.appendChild(code);
    }

    card.appendChild(iconWrapper);
    card.appendChild(content);

    formContainer.appendChild(card);
}

// Fetch form configuration from API
async function fetchFormConfig(bannerID) {
    try {
        const url = API_BASE_URL ?
            `${API_BASE_URL}${API_FETCH_BANNER}?dcb_uuid=${bannerID}` :
            `/${API_FETCH_BANNER}?dcb_uuid=${bannerID}`;

        const response = await fetch(url);
        let errorBody = null;

        if (!response.ok) {
            try {
                errorBody = await response.json();
            } catch (e) {
                // Ignore JSON parse errors
            }

            const apiMessage = errorBody && errorBody.message ? errorBody.message : 'Failed to load form configuration. Please try again later.';
            const statusCode = (errorBody && errorBody.status_code) ? errorBody.status_code : response.status;

            const err = new Error(apiMessage);
            err.statusCode = statusCode;
            throw err;
        }

        const data = await response.json();
        // use selected Language
        if (!data || !data.data || !data.data.dcb_info) {
            const apiMessage = (data && data.message) ? data.message : 'Invalid response format from API';
            const err = new Error(apiMessage);
            err.statusCode = (data && data.status_code) ? data.status_code : response.status;
            throw err;
        }
        return data.data.dcb_info;
    } catch (error) {
        console.error('Error fetching form configuration:', error);
        const msg = error && error.message ? error.message : 'Failed to load form configuration. Please try again later.';
        const statusCode = error && error.statusCode ? error.statusCode : '200';
        raiseMessage(msg, 'error', statusCode, '');
        throw error;
    }
}

// Function to dynamically inject CSS into form container (by id)
function injectCSS(containerID, config) {
    const textColor = config.uiSettings.text ?? "initial";
    const styleId = `dcb-style-${containerID}`;
    let styles = document.getElementById(styleId);
    if (!styles) {
        styles = document.createElement('style');
        styles.id = styleId;
        document.head.appendChild(styles);
    }

    styles.textContent = "#" + containerID + ` 
    {
        background-color: ${config.uiSettings.background};
        color: ${textColor};
        ${config.uiSettings.shape === "rectangle" ? "border-radius: 8px;" : "border-radius: 0px;"}
        ${config.uiSettings.size === "small" ? "width: 200px; padding: 10px;" : ""}
        ${config.uiSettings.size === "medium" ? "width: 400px; padding: 20px;" : ""}
        ${config.uiSettings.size === "large" ? "width: 600px; padding: 30px;" : ""}
        ${config.uiSettings.size === "custom" ? `width: ${config.uiSettings.customSize.width}; height: ${config.uiSettings.customSize.height}; padding: 20px;` : ""}
    }

    /* Prevent layout shift: show errors as overlay */
    #${containerID} [data-dcb-field="true"] {
        position: relative;
    }

    #${containerID} .error.dcb-field-error {
        position: absolute;
        left: 0;
        top: 100%;
        margin-top: 3px;
        z-index: 999;
        /* background: rgba(255, 255, 255, 0.96); */
        /* border: 1px solid rgba(220, 38, 38, 0.35); */
        color: #B91C1C;
        /* padding: 6px 10px; */
        /* border-radius: 8px; */
        font-size: 12px;
        line-height: 1.2;
        /* box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12); */
        max-width: 100%;
        width: max-content;
        white-space: normal;
        pointer-events: none;
    }

    #${containerID} .error.dcb-field-error.fade-out {
        opacity: 0;
        transform: translateY(-2px);
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
`;
}

// Helper function to fade out and remove error message with smooth transition
function fadeOutError(errorElement) {
    if (errorElement && errorElement.parentElement) {
        // Store original computed styles
        const computedStyle = window.getComputedStyle(errorElement);
        const originalHeight = errorElement.offsetHeight;
        const originalMarginTop = computedStyle.marginTop;
        const originalMarginBottom = computedStyle.marginBottom;
        const originalPaddingTop = computedStyle.paddingTop;
        const originalPaddingBottom = computedStyle.paddingBottom;

        // Set explicit styles for smooth transition
        errorElement.style.height = originalHeight + 'px';
        errorElement.style.marginTop = originalMarginTop;
        errorElement.style.marginBottom = originalMarginBottom;
        errorElement.style.paddingTop = originalPaddingTop;
        errorElement.style.paddingBottom = originalPaddingBottom;
        errorElement.style.maxHeight = originalHeight + 'px';
        errorElement.style.boxSizing = 'border-box';

        void errorElement.offsetHeight;

        errorElement.classList.add('fade-out');

        setTimeout(() => {
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 500);
    }
}


function validateField(field) {
    let host = field.closest('[data-dcb-field="true"]');
    if (!host) {
        host = field.parentElement;
        if (host && host.classList && host.classList.contains('otp-input-wrapper')) {
            host = host.parentElement;
        }
    }

    if (host) {
        const errorContainers = host.querySelectorAll('.error');
        errorContainers.forEach(error => error.remove());
    }

    const value = field.value.trim();
    const label = field.getAttribute('data-label') || field.label || 'Field';
    const isRequired = field.getAttribute('data-required') === 'true';

    // Check required
    if (isRequired && (!value || value === '')) {
        const requiredMsg = field.getAttribute('data-required-msg') || `${label} is required.`;
        showFieldError(field, requiredMsg);
        return false;
    }

    // Skip further validation if field is empty and not required
    if (!value) {
        return true;
    }

    // Email validation
    if (field.getAttribute('data-email') === 'true' || field.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            const emailMsg = field.getAttribute('data-email-msg') || 'Please enter a valid email address';
            showFieldError(field, emailMsg);
            return false;
        }
    }

    // Name field validation - only letters and spaces allowed
    if (field.getAttribute('data-name') === 'true') {
        // Only allow letters and spaces
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(value)) {
            const nameMsg = field.getAttribute('data-name-msg') || 'Name can only contain letters and spaces';
            showFieldError(field, nameMsg);
            return false;
        }
    }

    if (field.getAttribute('data-phone-only') === 'true') {
        // Indian mobile number regex pattern: ^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$
        const mobileRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
        if (!mobileRegex.test(value)) {
            const phoneMsg = field.getAttribute('data-phone-only-msg') || 'Please enter a valid mobile number';
            showFieldError(field, phoneMsg);
            return false;
        }
    }

    if (field.getAttribute('data-phone') === 'true' && !field.getAttribute('data-phone-only')) {
        // Allow digits, spaces, hyphens, parentheses, and + sign
        const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10 || digitsOnly.length > 15 || !phonePattern.test(value)) {
            const phoneMsg = field.getAttribute('data-phone-msg') || 'Please enter a valid phone number (10-15 digits)';
            showFieldError(field, phoneMsg);
            return false;
        }
    }

    const minLength = field.getAttribute('data-min-length');
    if (minLength && value.length < parseInt(minLength)) {
        const minLengthMsg = field.getAttribute('data-min-length-msg') || `Minimum ${minLength} characters required`;
        showFieldError(field, minLengthMsg);
        return false;
    }

    const maxLength = field.getAttribute('data-max-length');
    if (maxLength && value.length > parseInt(maxLength)) {
        const maxLengthMsg = field.getAttribute('data-max-length-msg') || `Maximum ${maxLength} characters allowed`;
        showFieldError(field, maxLengthMsg);
        return false;
    }

    const pattern = field.getAttribute('data-pattern');
    if (pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
            const patternMsg = field.getAttribute('data-pattern-msg') || 'Invalid format';
            showFieldError(field, patternMsg);
            return false;
        }
    }

    // Email validation
    if (field.getAttribute('data-pancard') === 'true' || field.type === 'pancard') {
        const pancardPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!pancardPattern.test(value)) {
            const pancardMsg = field.getAttribute('data-pancard-msg') || 'Please enter a valid PAN card number';
            showFieldError(field, pancardMsg);
            return false;
        }
    }

    if (field.getAttribute('data-aadhaar') === 'true' || field.type === 'aadhaar') {

        if (!isValidAadharNumber(value)) {
            const aadhaarMsg = field.getAttribute('data-aadhaar-msg') || 'Please enter a valid aadhaar number';
            showFieldError(field, aadhaarMsg);
            return false;
        }
    }

    return true;
}

// Function to check if all digits in the input are not the same (to prevent invalid Aadhaar numbers like 1111 1111 1111)
/**
 * 
 * @param {string} input 
 * @returns boolean - true if there are different digits, false if all digits are the same or input is not 12 characters long
 */
function checkDifferentDigits(input) {
    // Check if the length of the input is 12
    if (input.length !== 12) {
        return false;
    }

    // Check if all digits are the same
    const firstDigit = input[0];
    for (let i = 1; i < input.length; i++) {
        if (input[i] !== firstDigit) {
            return true; // At least one digit is different
        }
    }

    return false; // All digits are the same
}
// Function to validate Aadhaar number using Verhoeff algorithm
/**
 * 
 * @param {string} aadharNumber 
 * @returns boolean - true if valid, false if invalid
 */
function isValidAadharNumber(aadharNumber) {
    if (!aadharNumber) {
        return false;
    }
    if (!checkDifferentDigits(aadharNumber.toString())) {
        return false;
    }

    const r = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    const c = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];

    function reverseArray(e) {
        let x = [];
        if (typeof e === 'number') {
            e = String(e);
        }
        if (typeof e === 'string') {
            x = e.split('').map(Number);
        }
        return x.reverse();
    }

    return (function (e) {
        let t = 0;
        const n = reverseArray(e);
        for (let o = 0; o < n.length; o++) {
            t = r[t][c[o % 8][n[o]]];
        }
        return t === 0;
    })(aadharNumber);
}

function showFieldError(field, message) {
    let host = field.closest('[data-dcb-field="true"]');
    if (!host) {
        host = field.parentElement;
        if (host && host.classList && host.classList.contains('otp-input-wrapper')) {
            host = host.parentElement;
        }
    }
    if (!host) return;

    // Clear existing overlay errors for this field
    const existing = host.querySelectorAll('.error.dcb-field-error');
    existing.forEach(e => e.remove());

    // Ensure positioning context
    try {
        const pos = window.getComputedStyle(host).position;
        if (pos === 'static') host.style.position = 'relative';
    } catch (_) {
        host.style.position = 'relative';
    }

    const errorMessage = document.createElement('div');
    errorMessage.className = 'error dcb-field-error';
    errorMessage.textContent = message;
    host.appendChild(errorMessage);

    setTimeout(() => {
        fadeOutError(errorMessage);
    }, 5000);
}

// Function to validate required fields
function validateRequiredFields() {
    const requiredFields = Array.from(document.querySelectorAll('[data-required="true"]'));
    let allValid = true;

    document.querySelectorAll('.dcb-checkbox-summary-error').forEach(e => e.remove());

    const requiredCheckboxes = requiredFields.filter(f => f && f.type === 'checkbox');
    const uncheckedRequiredCheckboxes = requiredCheckboxes.filter(cb => !cb.checked);


    requiredCheckboxes.forEach(cb => {
        const host =
            cb.closest('[data-dcb-field="true"]') ||
            (cb.parentElement ? cb.parentElement.parentElement : null) ||
            cb.parentElement;
        if (host) host.querySelectorAll('.error').forEach(e => e.remove());
    });

    if (uncheckedRequiredCheckboxes.length > 0) {
        allValid = false;

        const anchorCb = requiredCheckboxes[requiredCheckboxes.length - 1] || uncheckedRequiredCheckboxes[0];
        const checkboxHost =
            anchorCb.closest('[data-dcb-field="true"]') ||
            (anchorCb.parentElement ? anchorCb.parentElement.parentElement : null) ||
            anchorCb.parentElement;

        if (checkboxHost) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error dcb-field-error dcb-checkbox-summary-error';
            errorMessage.textContent = 'Please select all required checkboxes to continue.';
            checkboxHost.appendChild(errorMessage);

            setTimeout(() => {
                fadeOutError(errorMessage);
            }, 5000);
        }
    }


    const nonCheckboxRequiredFields = requiredFields.filter(f => !(f && f.type === 'checkbox'));

    nonCheckboxRequiredFields.forEach(field => {
        // Use a stable host to avoid layout shifts
        let host = field.closest('[data-dcb-field="true"]');
        if (!host) {
            host = field.parentElement;
        }
        if (host && host.classList && host.classList.contains('otp-input-wrapper')) {
            host = host.parentElement;
        }

        if (host) {
            const errorContainers = host.querySelectorAll('.error');
            errorContainers.forEach(error => error.remove());
        }

        if (field.className === 'checkbox-group') {
            const checkboxGroupPayload = [];
            const checkboxGroupData = document.querySelectorAll(`input[name="${field.getAttribute('data-label')}[]"]`);
            checkboxGroupData.forEach(e => {
                if (e.checked) {
                    checkboxGroupPayload.push(e.value);
                }
            });

            if (!checkboxGroupPayload.length) {
                allValid = false;
                showFieldError(field, `${field.getAttribute('data-label')} is required.`);
            }
        }
        else if (field.className === 'radio-group') {
            if (!document.querySelector(`input[name="${field.getAttribute('data-label')}"]:checked`)) {
                allValid = false;
                showFieldError(field, `${field.getAttribute('data-label')} is required.`);
            }
        }
        else {
            if (field.tagName === 'TEXTAREA' || field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'phone' || field.type === 'number') {
                const fieldValue = field.value ? field.value.trim() : '';
                const fieldIsEmpty = !fieldValue || fieldValue === '';

                if (!validateField(field)) {
                    allValid = false;
                }

                // Check OTP verification status only if field has a value
                // Skip OTP check if field is empty to avoid showing both "required" and "OTP verification" errors
                if (!fieldIsEmpty && field.getAttribute('data-validate') === 'true') {
                    const isOtpVerified = field.getAttribute('data-otp-verified') === 'true';
                    if (!isOtpVerified) {
                        allValid = false;

                        const formControl = field.closest('[data-dcb-field="true"]') || field.parentElement;
                        const existingOtpError = formControl ? formControl.querySelector('.otp-validation-error') : null;
                        if (!existingOtpError) {
                            const errorMessage = document.createElement('div');
                            errorMessage.className = 'error dcb-field-error otp-validation-error';
                            errorMessage.textContent = `${field.getAttribute('data-label')} must be verified with OTP.`;
                            (formControl || field.parentElement).appendChild(errorMessage);


                            setTimeout(() => {
                                fadeOutError(errorMessage);
                            }, 5000);
                        }
                    }
                }
            } else if (!field.value || field.value.trim() === '') {
                allValid = false;
                showFieldError(field, `${field.getAttribute('data-label')} is required.`);
            }
        }
    });

    return allValid;
}

// Function to handle button actions
/**
 * 
 * @param {*} config 
 * @param {*} action 
 * @param {*} url 
 * @param {*} bannerID 
 * @param {*} containerID Added to reset feieds on Basis of containerID
 */
async function handleButtonClick(config, action, url, bannerID, containerID) {
    if (action === 'submit') {
        if (validateRequiredFields()) {
            // Simulate API call
            // alert('Form submitted successfully!');

            const payload = {};
            const uiPayload = {};
            const consentPayload = {};
            const checkboxGroupData = [];

            // Collect data from UI fields
            config.uiSettings.fields.forEach(field => {
                if (field.type !== 'button') {
                    const inputElement = document.querySelector(`[data-label="${field.label}"]`);
                    if (field.type === 'radio') {
                        const checkedRadio = document.querySelector(`input[name="${inputElement.getAttribute('data-label')}"]:checked`);
                        uiPayload[field.crmFieldName] =
                            checkedRadio ? checkedRadio.value : '';
                    }
                    else if (field.type === 'checkboxGroup') {
                        var checkboxGroupPayload = [];
                        const checkboxGroupData = document.querySelectorAll(`input[name="${inputElement.getAttribute('data-label')}[]"]`);
                        checkboxGroupData.forEach(e => {
                            if (e.checked) {
                                checkboxGroupPayload.push(e.value);
                            }
                        });
                        uiPayload[field.crmFieldName] = checkboxGroupPayload;

                    }
                    else {
                        uiPayload[field.crmFieldName] =
                            field.type === 'checkbox' ? inputElement.checked : inputElement.value;
                    }
                }
            });
            // Collect data from consent fields
            consentPayload['consentId'] = config.consentSettings.consentId;
            consentPayload['consent'] = config.consentSettings.consent;
            consentPayload['consentFields'] = [];
            config.consentSettings.consentFields.forEach(field => {
                const inputElement = document.querySelector(`[data-label="${field.label}"]`);
                // send payload for consent group
                consentPayload['consentFields'].push({
                    id: field.id,
                    label: field.label,
                    status: inputElement.checked
                });
            });
            payload['bannerId'] = bannerID;
            payload['uiSettings'] = uiPayload;
            payload['consentSettings'] = consentPayload;


            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit banner.');
                }

                // // Show success message
                // const formContainer = document.getElementById('form-container');
                // let successMessage = formContainer.querySelector('.success-message');
                // if (!successMessage) {
                //     successMessage = document.createElement('div');
                //     successMessage.className = 'success-message';
                //     successMessage.textContent = 'Banner submitted successfully!';
                //     formContainer.appendChild(successMessage);
                // }
                // successMessage.style.display = 'block';

                // setTimeout(() => {
                //     successMessage.style.display = 'none';
                // }, 3000); // Hide message after 3 seconds

                resetForm(containerID);
                raiseMessage('Banner submitted successfully!', 'success', '200', '');
                //alert('Banner submitted successfully!');
            } catch (error) {
                console.error('Error submitting banner:', error);
                raiseMessage('Failed to submit Banner. Please try again later.', 'error', '200', '');
                //alert('Failed to submit Banner. Please try again later.');
            }
        }
    } else if (action === 'next') {
        raiseMessage('Proceeding to the next step!', 'success', '200', '');
        //alert('Proceeding to the next step!');
    }
}

// Function to reset all fields
/**
 * Resets form on basis of containerID
 * @param {*} containerID 
 * @returns void
 */
function resetForm(containerID) {
    // Find container dynamically if not provided
    let container = null;
    if (containerID) {
        container = document.getElementById(containerID);
    } else {
        // Fallback: try to find container by looking for form elements
        const firstInput = document.querySelector('input[data-label], select[data-label]');
        if (firstInput) {
            container = firstInput.closest('[id]');
        }
    }

    if (!container) {
        console.warn('Form container not found for reset');
        return;
    }

    // Reset all form fields in the container
    const formFields = container.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        // Re-enable all disabled fields
        if (field.disabled) {
            field.disabled = false;
            field.style.opacity = '1';
            field.style.cursor = field.type === 'checkbox' || field.type === 'radio' ? 'pointer' : 'text';
        }

        // Reset OTP verification state
        if (field.hasAttribute('data-otp-verified')) {
            field.setAttribute('data-otp-verified', 'false');
        }

        if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = false;
        } else if (field.type === 'select' || field.type === 'select-one') {
            field.selectedIndex = 0;
        } else {
            field.value = '';
        }
    });

    // Reset OTP-related UI elements
    const otpInputWrappers = container.querySelectorAll('.otp-input-wrapper');
    otpInputWrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input[data-validate]');
        if (input) {
            // Reset input padding
            input.style.paddingRight = '';

            // Show verify label
            const verifyLabel = wrapper.querySelector('.otp-verify-label');
            if (verifyLabel) {
                verifyLabel.style.display = 'block';
            }

            // Hide success tick
            const successTick = wrapper.querySelector('.otp-success-tick');
            if (successTick) {
                successTick.style.display = 'none';
            }

            // Hide OTP container
            const otpContainer = wrapper.querySelector('.otp-container');
            if (otpContainer) {
                otpContainer.style.display = 'none';
            }

            // Clear OTP input
            const otpInput = wrapper.querySelector('.otp-input');
            if (otpInput) {
                otpInput.value = '';
            }

            // Reset resend button
            const resendButton = wrapper.querySelector('.otp-resend-button');
            if (resendButton) {
                resendButton.style.display = 'none';
                resendButton.disabled = false;
                resendButton.textContent = 'Resend OTP';
                resendButton.style.opacity = '1';
            }
        }
    });

    // Remove all error messages
    const errorMessages = container.querySelectorAll('.error');
    errorMessages.forEach(error => error.remove());
}

// Raise and dispatch window event to show success and error message 
function raiseMessage(msgString, msgType, status, responseText) {
    var event = 'DCBajaxSuccess';
    var formatString = '';
    if (msgType == 'success') {
        formatString = `
            <div class="toast_box toast_success">
                <div class="toast_row">
                    <span class="icon_box">
                        <svg fill="#00DC50" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#00DC50" stroke-width="0.048">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.676,8.237-6,5.5a1,1,0,0,1-1.383-.03l-3-3a1,1,0,1,1,1.414-1.414l2.323,2.323,5.294-4.853a1,1,0,1,1,1.352,1.474Z"/>
                            </g>
                        </svg>
                    </span>
                    <div class="toast_text">
                        <strong>Success</strong>
                        <span>`+ msgString + `</span>
                    </div>
                    <a href="#" class="toast_close">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4.85171L1.01901 7.8327C0.907478 7.94423 0.765526 8 0.593156 8C0.420786 8 0.278834 7.94423 0.1673 7.8327C0.0557666 7.72117 0 7.57921 0 7.40684C0 7.23447 0.0557666 7.09252 0.1673 6.98099L3.14829 4L0.1673 1.01901C0.0557666 0.907478 0 0.765526 0 0.593156C0 0.420786 0.0557666 0.278834 0.1673 0.1673C0.278834 0.0557666 0.420786 0 0.593156 0C0.765526 0 0.907478 0.0557666 1.01901 0.1673L4 3.14829L6.98099 0.1673C7.09252 0.0557666 7.23447 0 7.40684 0C7.57921 0 7.72117 0.0557666 7.8327 0.1673C7.94423 0.278834 8 0.420786 8 0.593156C8 0.765526 7.94423 0.907478 7.8327 1.01901L4.85171 4L7.8327 6.98099C7.94423 7.09252 8 7.23447 8 7.40684C8 7.57921 7.94423 7.72117 7.8327 7.8327C7.72117 7.94423 7.57921 8 7.40684 8C7.23447 8 7.09252 7.94423 6.98099 7.8327L4 4.85171Z" fill="#BCBCBB"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }
    else if (msgType == 'error') {
        formatString = `
            <div class="toast_box toast_error">
                <div class="toast_row">
                    <span class="icon_box">
                        <svg width="20" height="20" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 1.0625C4.35625 1.0625 1.0625 4.35625 1.0625 8.5C1.0625 12.6438 4.35625 15.9375 8.5 15.9375C12.6438 15.9375 15.9375 12.6438 15.9375 8.5C15.9375 4.35625 12.6438 1.0625 8.5 1.0625ZM11.7937 11.7937C11.559 12.0285 11.1785 12.0285 10.9437 11.7937L8.5 9.35L6.05625 11.7937C5.82153 12.0285 5.44097 12.0285 5.20625 11.7937V11.7937C4.97153 11.559 4.97153 11.1785 5.20625 10.9437L7.65 8.5L5.20625 6.05625C4.97153 5.82153 4.97153 5.44097 5.20625 5.20625V5.20625C5.44097 4.97153 5.82153 4.97153 6.05625 5.20625L8.5 7.65L10.9437 5.20625C11.1785 4.97153 11.559 4.97153 11.7937 5.20625V5.20625C12.0285 5.44097 12.0285 5.82153 11.7937 6.05625L9.35 8.5L11.7937 10.9437C12.0285 11.1785 12.0285 11.559 11.7937 11.7937V11.7937Z" fill="#F5194F"/>
                        </svg>
                    </span>
                    <div class="toast_text">
                        <strong>Success</strong>
                        <span>`+ msgString + `</span>
                    </div>
                    <a href="#" class="toast_close">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4.85171L1.01901 7.8327C0.907478 7.94423 0.765526 8 0.593156 8C0.420786 8 0.278834 7.94423 0.1673 7.8327C0.0557666 7.72117 0 7.57921 0 7.40684C0 7.23447 0.0557666 7.09252 0.1673 6.98099L3.14829 4L0.1673 1.01901C0.0557666 0.907478 0 0.765526 0 0.593156C0 0.420786 0.0557666 0.278834 0.1673 0.1673C0.278834 0.0557666 0.420786 0 0.593156 0C0.765526 0 0.907478 0.0557666 1.01901 0.1673L4 3.14829L6.98099 0.1673C7.09252 0.0557666 7.23447 0 7.40684 0C7.57921 0 7.72117 0.0557666 7.8327 0.1673C7.94423 0.278834 8 0.420786 8 0.593156C8 0.765526 7.94423 0.907478 7.8327 1.01901L4.85171 4L7.8327 6.98099C7.94423 7.09252 8 7.23447 8 7.40684C8 7.57921 7.94423 7.72117 7.8327 7.8327C7.72117 7.94423 7.57921 8 7.40684 8C7.23447 8 7.09252 7.94423 6.98099 7.8327L4 4.85171Z" fill="#BCBCBB"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
        event = 'DCBajaxError';
    }
    // Emit a failure/success event (for backward compatibility)
    const errorEvent = new CustomEvent(event, {
        detail: { message: formatString, status: status, response: responseText }
    });
    window.dispatchEvent(errorEvent);


    if (typeof window !== 'undefined' && window.DSGToast) {
        if (msgType === 'success') {
            window.DSGToast.success(formatString);
        } else if (msgType === 'error') {
            window.DSGToast.error(formatString);
        }
    }
}

// class for Toast message
const DSGToast = (function () {
    let container = null;

    const initContainer = () => {
        if (typeof document === 'undefined') return null;
        if (container && document.body.contains(container)) return container;

        // Check if container already exists in DOM
        const existingContainer = document.getElementById('toast-container');
        if (existingContainer) {
            container = existingContainer;
            return container;
        }

        if (!document.body) return null;

        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '9999';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        return container;
    };

    // Function to show a toast message
    const showToast = (message, type = 'info') => {
        if (typeof document === 'undefined') return;

        const toastContainer = initContainer();
        const toast = document.createElement('div');
        toast.className = `dsg-toast toast-${type}`;
        toast.style.minWidth = '200px';
        toast.style.pointerEvents = 'auto';
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '1';

        // Add message
        toast.innerHTML = message;

        // Append to container
        toastContainer.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toastContainer && toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 500);
        }, 3000);
    };

    return {
        init: initContainer,
        success: (message) => showToast(message, 'success'),
        error: (message) => showToast(message, 'error'),
        warning: (message) => showToast(message, 'warning'),
        info: (message) => showToast(message, 'info'),
    };
})();

// Make DSGToast available globally
if (typeof window !== 'undefined') {
    window.DSGToast = DSGToast;

    // Auto-initialize toast system and set up event listeners
    const initializeToastSystem = () => {
        // Initialize toast container
        DSGToast.init();

        // Set up event listeners for automatic toast display
        const handleSuccess = (event) => {
            if (DSGToast && event.detail && event.detail.message) {
                DSGToast.success(event.detail.message);
            }
        };

        const handleError = (event) => {
            if (DSGToast && event.detail && event.detail.message) {
                DSGToast.error(event.detail.message);
            }
        };

        window.removeEventListener('DCBajaxSuccess', handleSuccess);
        window.removeEventListener('DCBajaxError', handleError);

        // Add event listeners
        window.addEventListener('DCBajaxSuccess', handleSuccess);
        window.addEventListener('DCBajaxError', handleError);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeToastSystem);
    } else {
        initializeToastSystem();
    }
}