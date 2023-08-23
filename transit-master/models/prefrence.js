/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('prefrence', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		fillter_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		category: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		from_latitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:""
		},
		from_longitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:""
		},
		to_latitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:""
		},
		to_longitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue:""
		},
		miles: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		from_location_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		to_location_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'prefrence'
	});
};
