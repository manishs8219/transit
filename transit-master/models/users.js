/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		role: {
			type: DataTypes.TINYINT(4),
			allowNull: true,
         },
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		phone: {
			type: DataTypes.BIGINT,
			allowNull: true,
			defaultValue:0
		},
		phone_number: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},

		country: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''
		},
		dobtimestamp: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''

		},
		otp: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:1111
		},
		verify_otp: {
			type: DataTypes.TINYINT(4),
			allowNull: true,
			defaultValue:0

		},

		dob: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''

		},
		d_licence_front_image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''
		},
		d_licence_backs_image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''

		},
		insurance_file: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''

		},
		insurance_company: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''


		},
		level_coverage: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:''

		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		createdAt: {
			field: "created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field: "updated_at",

			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:1
		},
		deviceType: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			defaultValue:0

		},
		deviceToken: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''

		},
		forgotPasswordHash: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		social_type: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''

		},
		social_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''

		},
		notification_status: {
			type: DataTypes.TINYINT(4),
			allowNull:true,
			defaultValue:1
     	},
		track_status:{
			type:DataTypes.TINYINT(4),
			allowNull:true,
			defaultValue:1
        },
		login_time:{
			type:DataTypes.BIGINT,
			allowNull:true,
			defaultValue:0
        },
		resetpassword_token: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		latitude: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:"0"
		
		},
		longitude: {
			type: DataTypes.STRING(255),
			allowNull: true,
		defaultValue:"0"
		},
		token: {
			type: DataTypes.STRING(255),
			allowNull: true,
		defaultValue:"0"
		},
		
		

	}, {
		tableName: 'users'
	});
};
