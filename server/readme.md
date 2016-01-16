Interloop-api V1
===================
The Interloop Platform API - Built on top of Stronglooop

Models
-------------
####Application Models

<b>organization</b> - Company that purchases interloop

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name 	| String | Name of Organization  | Pied Piper, Inc.
| url	| String | Url of Org Domain	  | piedpiper.interloop.io
| main_contact | String | Name of Main Contact | Richard Hendricks
| main_email | String | email of main contact | rhendricks@piedpiper.com
| main_phone | String | phone Number of Main Contact | 949-834-9878
| version | String | release version of Interloop | v1.0.2


<b>team</b> - Group within Organization Using Interloop workspace

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name 	| String | Name of Team  | NorthWest
| description 	| String | Description of Team  | NorthWest Sales Team
| team_admin	| string | Id of team admin | userId

<b>member</b> -  People within a team

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| first_name | String | First Name  | Richard
| last_name | String | Last Name  | Hendricks
| full_name	| String | Concatenation of First & Last | Richard Hendricks
| email	| Array of Objects | Emails of User |rhendricks@piedpiper.com
| phone | Array of Objects | Phone #'s of User | 704-987-7859
| social	| Array of Objects | Social Media Accounts
| timezone | String | Preferred Time Zone of User | Los Angeles
| last_read | date | Last Time User Read Notifications |
| credentials | object | Loopback Generated Object for logging / out 

**Emails and Phone Numbers are stored as an Array of Objects **

See Example Below:
<br>
"Emails": 
<br>
[{
"name":"workd",
"address":"rhendricks@piedpiper.com"
"default":true"
}]

####Primary Entities

<b>company</b> - Companies used as sales targets or other

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| Name | String | company name  | Homicide Energy
| description | String | Last Name  | Energy Drink Company
| website	| String | website | homicideenergy.com
| address	| Array of Objects | Company Locations | 
| score | number | Smart score of company | 6.2
| custom_values | array of objects | custom values for company | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>contact</b> - People used as sales targets or other

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| first_name | String | First Name  | Richard
| last_name | String | Last Name  | Hendricks
| full_name	| String | Concatenation of First & Last | Richard Hendricks
| email	| Array of Objects | Emails of User | rhendricks@piedpiper.com
| phone | Array of Objects | Phone #'s of User | 704-987-7859
| social	| Array of Objects | Social Media Accounts
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>opportunity</b> - Deal within Pipeline

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name | String | Member given name of Opp  | Marketplace Deal
| description | string | short description of opp | Software opportunity in marketing department
| value | number | value of opportunity  | 5000
| value_period |  string | recurring or static | annual, monthly, single
| value_currency | string | currency of opportunity | yen
| estimated_close | date | projected date of close | 
| actual_close | date | actual date of closing deal | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |


<b>task</b> - Actionable to-dos

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| subject | String | subject of task  | Customer Demo
| description | string | description of task | Complete demo ...
| planned_date | date | when member plans to work on task  | tomorrow
| completed_date |  date | date task actually completed | 
| is_complete | boolean | whether task is complete |
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>post</b> - Communication Forums

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| content | String | content of post  | "Hey guys check out ..."
| likes | array of objects | joe liked the post | 
| comments | array of objects | comments on posts  | "awesome job"
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>dashboard</b> - Visual Analytics Pages

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name | String | name of dashboard page  | Forecast
| description | string | description of dashboard | Simple Forecasting Summaries
| content | array of objects | contains json object of charting elements | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>view</b> - Saved Views of either Companies, Contacts, Pipelines, or Dashboards

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name | String | name of view  | Customers by Created Date
| description | string | description of dashboard | Simple Forecasting Summaries
| type | string | type of view  | 
| query | array of objects | strings / arrays of query data  | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

####Secondary Entities

Custom Values - 
[{
"custom_id":"123",
"value":"456" }]

Fields

[{
id:"123"
"name":"Industry Codes",
values: [{
"id":"456"
"label": "gardening"
},
{
"id":"456"
"label": "gardening"
}]
}]


<b>history</b> - Historical items against entities

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| subject | String | name of history item  | completed task
| description | string | description of history item | 
| type | string | type of history item  |  
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>company_status</b> - Informational Status to Describe state of entity

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>contact_status</b> - Informational Status to Describe state of entity

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>opportunity_status</b> - Informational Status to Describe state of entity

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>opportunity_stage</b> - Sales process steps

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>step</b> - Milestones within stages

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>custom_field</b> - Custom Information Fields to be added to entities

<b>qualifier</b> - Profiling 

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| label | String | label for status  | Bad Fit
| description | string | description of status | 
| type | string | type determines UI (Slider vs Picklist) |
| value | string | value of particular qualifer per company |
| weight | number | 1-5 weighting |
| active | boolean | Displayed / not displayed for reps |
| *created_date | date | created date of entity |
| *updated_date | date | updated date of entity |

<b>notification</b> - Notifications by user

| Name     | Type  | Description   | Example  |
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| subject | String | label for status  | "Jordan Berry completed task ABC"  |
| *created_date | date | created date of entity | |
| *updated_date | date | updated date of entity | |

<b>document</b> - Metadata and url of uploaded documents

| Name     		| Type  	| Description   					| Example  									|
|:------------- |:--------- |:--------------------------------- |:-----------------------------------------	|
| name 			| String 	| label for document  				| "Jordan's Doc" 							|
| file_name 	| string 	| actual file name 					| jordan_doc.docx 							|
| description 	| string 	| description of status 			| "awesome document" 						|
| url 			| string 	| location of cloud stored document | http://s3-amazon.com/docs/jordan_doc.docx |
| type 			| string 	| type of document files 			| powerpoint 								|
| *created_date | date 		| created date of entity 			|											|
| *updated_date | date 		| updated date of entity 			|											|



----------


Roles
-------------------
Executive - Sees all teams and all Data within org (Can also view as manager of each team) - 

Manager - (Sees all data within team and added ui benefits (Manage team access, added dashbaords, etc)

Rep - Can see only data within team and basic ui benefits

Admin - Executive View, Can Make Changes, Billing, ETc

Two types of team dynamics - 
Open / Closed Models are set at Team Level - Can be master set at org level


----------