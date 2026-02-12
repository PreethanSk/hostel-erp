import styled from '@emotion/styled'
import { FormControlLabel } from '@mui/material'
import Switch, { SwitchProps } from '@mui/material/Switch';

export default function CustomSwitch({ label = '', checked, onChange, }: any) {
    const IOSSwitch = styled((props: SwitchProps) => (
        <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
    ))(({ }) => ({
        width: 38,
        height: 20,
        padding: 0,
        '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    backgroundColor: '#11AA76',
                    opacity: 1,
                    border: 0,

                },
                '&.Mui-disabled + .MuiSwitch-track': {
                    opacity: 0.5,
                },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
                color: '#11AA76',
                border: '6px solid #fff',
            },

        },
        '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 16,
            height: 16,
        },
        '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: '#E9E9EA',
            opacity: 1,

        },
    }))

    return <>
        <FormControlLabel control={<IOSSwitch sx={{ m: 1 }} checked={checked} onChange={onChange} />} label={label} />
    </>
}
