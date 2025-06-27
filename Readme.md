# 🧾 UI Schema JSON Format Guidelines

This guide defines the **strict JSON format** used to build UI pages for our schema-driven React + Tauri app.

All JSONs follow this nested layout structure, and GPT must strictly conform to it when generating output.

---

## 🧱 Layout Hierarchy

```json
PageName → [
  {
    "css": "/styles.css",
    "section": {
      "style": { ... },
      "Row_1": {
        "col_1": {
          "Fields": [ ...components... ]
        }
      },
      "Row_2": { ... },
      ...
    },
    "table": [ { "name": "...", "Alias": "...", "type": "select|edit" } ]
  }
]

✅ Approved Components (Inside Fields)
🔹 label_1
"label_1": {
  "children": "Patient Name"
}
🔹 text_1
"text_1": {
  "placeholder": "Enter your name",
  "value": "",
  "set": "$T1#Name$",
  "validation": { "required": true }
}
🔹 dropDown_1
"dropDown_1": {
  "options": ["Male", "Female", "Other"],
  "select": "",
  "set": "$T1#Gender$",
  "validation": { "required": true }
}
⚠️ label_* should always appear before dropDown_* or text_*.

🧩 Card Formats
🅰️ Card Format A – Metadata Card
"card_1": {
  "labels": [
    { "text": "Branch Name", "className": "left-section" },
    { "text": "Transaction Date", "className": "right-section" },
    { "text": "Login Date and Time", "className": "right-section" }
  ],
  "fields": ["A.MBRI_Name", "A.Transferdate", "A.Date"],
  "formattype": "A",
  "style": { "width": "70%" }
}
🅱️ Card Format B – Visual Card
"card_2": {
  "title": "GRT",
  "imageUrl": "/images/lafstatus.png",
  "formattype": "B",
  "pagenation": {
    "CurrentPage": "1",
    "Module": "GRT",
    "commandType": "Next",
    "Extension": "bottom"
  }
}
🅾️ Card Format C – Stats Card
"card_3": {
  "labels": ["Applications", "Amount"],
  "fields": ["136", "16320000"],
  "formattype": "C"
}
📊 barGraph
"barGraph": {
  "data": [
    { "label": "JAN", "value1": 45, "value2": 35 },
    { "label": "FEB", "value1": 35, "value2": 20 }
  ]
}
📁 tabs
"tabs": {
  "pages": [
    { "label": "Info", "currentPage": 1 },
    { "label": "Analytics", "currentPage": 2 }
  ]
}
🔽 accordion_1
"accordion_1": {
  "title": "Details",
  "initialOpen": true,
  "icon": "microscope",
  "Row_2": { ... },
  "Row_3": { ... }
}
🧲 iconButton_1
"iconButton_1": {
  "icon": "Refresh",
  "label": "",
  "type": "RefreshButton",
  "style": {
    "background": "none",
    "color": "#afa5a5",
    "marginTop": "-6px",
    "right": "16vw"
  }
},
Map
"iconButton": {
                  "icon": "MapOutlined",
                  "tabpage": 1,
                  "label": "View On Map",
                  "type": "IconButton",
                  "style": {
                    "background": "#fff",
                    "color": "black"
                  }
                }
🚀 EventButton
"EventButton": {
  "label": "Save & Next"
}

🧲 Radio
"radio": {
           
          "options": [
                { "value": "Single", "text": "Single" },
                { "value": "Double", "text": "Double" }
              ],
              "validation": {
                "required": true,
                "message": "Please select an option"
              }
              }

Camera

              "camera": { "id": "camera_1",
              "getimage":"$API#AAdhar$",
              "setImage":"$T3#Gender$", "formatType": "Aadhaar" }



📜 Required Style Format (example)
"style": {
  "display": "flex",
  "flexDirection": "row",
  "flexWrap": "nowrap",
  "justifyContent": "space-between",
  "alignItems": "stretch",
  "width": "100%",
  "paddingLeft": "13px",
  "marginBottom": "-23px",
  "background": "#fff",
  "padding": "17px",
  "borderRadius": "10px",
  "boxShadow": "0 2px 5px rgba(0, 0, 0, 0.1)"
}
### 🔧 Styling Guidelines

- All input boxes (text/password), cards, and login fields must have:
  - `border: "2px solid green"`
  - `borderRadius: "12px"`
  - `padding` of at least `"10px"`

- Use a light background (`#fff`) for contrast.
- The login card section must center horizontally and have `marginTop: "320px"`.

These styles must be applied unless overridden by specific instruction.

⚠️ Rules & Constraints
Rule	          Description
✅ label_*	    Must appear above the corresponding field
✅ dropDown_1	Must have options, select, set, validation
✅ card_1	    Must contain labels[], fields[], and formattype
✅ section	    Must include "style"
✅ Fields	    Only allowed keys: label_*, text_*, dropDown_*, card_*, barGraph, iconButton_*, tabs, accordion_*, EventButton
❌ label inside dropDown	Not allowed — use label_1 separately above dropDown_1
✅ barGraph	Must include label, value1, value2 inside data[]
✅ Row → Column → Fields	Row_X → col_1 → Fields[] always
✅ camera will be Fields and used as camera_1,camera_2 with id and formatType
✅ All `card_x` must include:
- `labels`: array of objects like { "text": "Label", "className": "..." }
- `fields`: array of string references or values
- `formattype`: must be "A", "B", or "C"
### 🔸 Label Rules

- ✅ Inside `card_*`:
  - `"labels"` must be an **array of objects**, each with at least a `"text"` key and optional `"className"`:
    ```json
    "labels": [
      { "text": "Branch Name", "className": "left-section" },
      { "text": "Date", "className": "right-section" }
    ]
    ```

- ✅ Outside cards (in `text_*`, `dropDown_*`, etc.):
  - Use `"label"` as a simple string:
    ```json
    "text_1": {
      "label": "Patient Name",
      ...
    }
    ```

- ❌ Do NOT use:
  - `"labels": ["Name", "Age"]`
  - `"label": { "text": "..." }` (outside of cards)

We can use table like this to filter:
  "Row_2": {
              "col_1": {
                "Fields": [
                  {
                    "table": {
                      "title": "Fees Collection Charges",
                      "Rowvalues": "$T3_Row$",
                      "columnTitles": ["", "Fees Name", "Fee Amount","Waiver","GST", "Collectable Fee"],
                      "rowVar": [["", "LSS00014", "Test4", "Testing","THired One", "Non","One"]],
                      "rowTypes": ["", "", "", "","","",""],
                      "rowVisible": ["false", "true", "true", "true","true","false","false"],
                      "rowFilter": ["false", "true", "true", "true","true","true","true"],
                      "rowFilterType": ["", "", "","text","text","text",""]
                    }
                  }
                ]
              }
                   }

  ## Example:
  {
  "MedicalHistory": [
    {
      "css": "./MedicalHistoryStyles.css",
      "table": [
        {
          "name": "MedicalHistorySubmit",
          "Alias": "MH1",
          "type": "select"
        }
      ],
      "Section": {
        "style": { "width": "80%" },
        "Row_1": {
          "col_1": {
            "Fields": [
              {
                "tabs": {
                  "pages": [
                    { "label": "Overview", "currentPage": 1 },
                    { "label": "Surgical History", "currentPage": 2 }
                  ]
                }
              }
            ]
          }
        },
        "Row_2": {
          "style": { "gap": "10px" },
          "accordion_1": {
            "title": "Known Conditions",
            "initialOpen": true,
            "icon": "stethoscope",
            "Row_3": {
              "col_1": {
                "Fields": [
                  {
                    "label_1": { "children": "Select Condition" },
                    "dropDown_1": {
                      "options": ["Diabetes", "Hypertension", "Asthma", "None"],
                      "select": "",
                      "set": "$MH1#Conditions$",
                      "validation": { "required": true }
                    }
                  }
                ]
              },
              "col_2": {
                "Fields": [
                  {
                    "label_2": { "children": "Diagnosis Date" },
                    "date_1": {
                      "placeholder": "DD/MM/YYYY",
                      "value": "",
                      "set": "$MH1#DiagDate$"
                    }
                  }
                ]
              }
            }
          },
          "accordion_2": {
            "title": "Family History",
            "initialOpen": false,
            "icon": "users",
            "Row_4": {
              "col_1": {
                "Fields": [
                  {
                    "label_1": { "children": "Select Family Member" },
                    "dropDown_2": {
                      "options": ["Mother", "Father", "Sibling", "Other"],
                      "select": "",
                      "set": "$MH1#FamilyMember$",
                      "validation": { "required": true }
                    }
                  },
                  {
                    "label_2": { "children": "Condition" },
                    "text_3": {
                      "placeholder": "e.g. Heart Disease",
                      "type": "text",
                      "value": "",
                      "set": "$MH1#FamilyCondition$"
                    }
                  }
                ]
              }
            }
          },
          "Row_5": {
            "col_1": {
              "Fields": [
                {
                  "label_1": { "children": "Current Medications" },
                  "text_4": {
                    "placeholder": "List meds",
                    "type": "textarea",
                    "value": "",
                    "set": "$MH1#Medications$"
                  }
                }
              ]
            }
          },
          "Row_6": {
  "col_1": {
    "Fields": [
      {
        "barGraph": {
          "data": [
            {
              "label": "Diabetes","value1": 45,"value2": 60
            },
            {
              "label": "Asthma", "value1": 75, "value2": 62
            }
          ]
        }
      }
    ]
  }
},
          "Row_7": {
            "col_1": {
              "Fields": [
                {
                  "EventButton": { "label": "Save Medical History" }
                }
              ]
            }
          }
        }
      }
    }
  ]
}
 
 